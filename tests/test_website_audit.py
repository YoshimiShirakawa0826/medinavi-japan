import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('website_audit', Path(__file__).parents[1] / 'scripts/website-audit/audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class WebsiteAuditTest(unittest.TestCase):
    def test_internal_credentials_and_non_web_urls_are_rejected(self):
        for value in ['file:///etc/passwd', 'javascript:alert(1)', 'https://user:pass@example.com/',
                      'http://127.0.0.1/', 'http://169.254.169.254/', 'http://localhost/', 'https://a.internal/', 'https://example.com:8080/']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                audit.safe_url(value)
        self.assertEqual(audit.safe_url('https://EXAMPLE.com/a#section'), 'https://example.com/a')
        with patch.object(audit.socket, 'getaddrinfo', return_value=[(0, 0, 0, '', ('127.0.0.1', 443))]):
            with self.assertRaises(ValueError):
                audit.public_dns('https://example.com/')

    def test_clinical_links_outrank_english_navigation_and_external_translation_is_excluded(self):
        links = [('/en/sitemap.php', 'Site Map'), ('/en/privacy.php', 'Privacy Policy'),
                 ('/departments/international/', '国際医療センター'), ('/en/', 'English'),
                 ('/en/outpatient/001.php', 'For New Patients'),
                 ('https://translate.google.com/', 'English'), ('/jobs/', '英語ができる方を採用')]
        ranked = audit.rank_links('https://example.com/', links)
        self.assertEqual(ranked[0]['url'], 'https://example.com/departments/international/')
        self.assertEqual(ranked[1]['url'], 'https://example.com/en/outpatient/001.php')
        self.assertTrue(any('outpatient' in row['url'] for row in ranked))
        self.assertFalse(any('sitemap' in row['url'] or 'privacy' in row['url'] or 'google' in row['url'] or 'jobs' in row['url'] for row in ranked))

    def test_image_navigation_and_new_patient_labels_are_followed(self):
        document = audit.Document()
        document.feed('<a href="/english/"><img alt="English" src="en.png"></a><a href="/english/detail/1.html">New Patients</a>')
        ranked = audit.rank_links('https://example.com/', document.links)
        self.assertEqual(ranked[0]['url'], 'https://example.com/english/detail/1.html')
        self.assertEqual(ranked[1]['url'], 'https://example.com/english/')
        self.assertTrue(audit.snippets('We speak English. Please make an appointment.'))
        self.assertTrue(audit.snippets('外国語対応について：英語、ポルトガル語。'))

    def test_scripts_are_not_text_and_a_negative_statement_is_preserved_as_a_candidate(self):
        document = audit.Document()
        document.feed('<script>英語診療が可能</script><svg/><p>We do not have medical interpreters.</p><p>English-speaking staff can assist.</p>')
        self.assertNotIn('英語診療', document.text())
        snippets = audit.snippets(document.text())
        self.assertTrue(snippets)
        self.assertIn('do not have medical interpreters', snippets[0])

    def test_host_shards_are_disjoint_and_preserve_each_facility_identity(self):
        clinics = [{'id': str(index), 'website': url} for index, url in enumerate([
            'http://example.com/a', 'https://example.com/b', 'https://other.example/a', 'https://other.example/a'])]
        pieces = [audit.group_sites(clinics, shard, 8) for shard in range(8)]
        actual = [row['id'] for piece in pieces for values in piece.values() for row in values]
        self.assertCountEqual(actual, ['0', '1', '2', '3'])
        self.assertEqual(sum('http://example.com/a' in piece for piece in pieces), 1)
        same_host = [piece for piece in pieces if 'http://example.com/a' in piece][0]
        self.assertIn('https://example.com/b', same_host)
        self.assertEqual(len([piece for piece in pieces if 'https://other.example/a' in piece][0]['https://other.example/a']), 2)

    def test_csv_cells_do_not_become_spreadsheet_formulas(self):
        for value in ['=1+1', '+1', '-1', '@SUM(A1)', '  =1', '\t=1']:
            self.assertTrue(audit.csv_safe(value).startswith("'"))
        self.assertEqual(audit.csv_safe('東京都の医院'), '東京都の医院')

    def test_resumption_preserves_a_successful_source_when_a_child_temporarily_fails(self):
        class Reader:
            def page(self, url):
                return {'requestedUrl': url, 'status': 'fetch_unavailable'}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'site.json'
            original = {'version': audit.VERSION, 'website': 'https://example.com/', 'complete': True, 'pages': [
                {'requestedUrl': 'https://example.com/', 'url': 'https://example.com/', 'contentSha256': 'a' * 64,
                 'status': 'retrieved', 'candidates': ['Medical interpreters are available.']},
                {'requestedUrl': 'https://example.com/english', 'status': 'fetch_unavailable'}]}
            path.write_text(json.dumps(original))
            result = audit.audit_site(original['website'], Reader(), 2, path, retry=True)
            self.assertTrue(any(page.get('contentSha256') == 'a' * 64 for page in result['pages']))
            self.assertTrue(result['complete'])


if __name__ == '__main__':
    unittest.main()
