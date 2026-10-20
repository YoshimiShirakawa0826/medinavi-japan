import importlib.util
import json
import gzip
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('audit_report', Path(__file__).parents[1] / 'scripts/build-website-audit-report.py')
report = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report)


class AuditReportTest(unittest.TestCase):
    def clinic(self, identifier='1'):
        return {'id': identifier, 'name': '医院' + identifier, 'address': '所在地', 'website': 'https://example.com/', 'prefecture': '01'}

    def entry(self, mode, languages):
        return {'mode': mode, 'languages': languages, 'reservation': 'advance_contact', 'notes': {'ja': '事前に相談'},
                'sources': [{'url': 'https://example.com/english', 'checkedAt': '2026-10-20'}]}

    def test_unreviewed_candidate_never_becomes_a_clinical_language(self):
        result = {'pages': [{'textCharacters': 300, 'status': 'retrieved', 'url': 'https://example.com/',
                             'candidates': ['There are no medical interpreters.']}], 'complete': True}
        rows, summary = report.build_report([self.clinic()], {'https://example.com/': result}, [], [])
        self.assertEqual(rows[0]['registered_clinical_languages'], '')
        self.assertEqual(rows[0]['language_review_status'], 'candidate_requires_identity_and_context_review')
        self.assertEqual(summary['urlsWithBody'], 1)
        self.assertFalse(summary['languageConfirmationComplete'])

    def test_shared_url_does_not_copy_a_facility_review(self):
        review = {'clinicId': '1', 'entries': [self.entry('doctor', ['en'])]}
        rows, summary = report.build_report([self.clinic(), self.clinic('2')], {}, [review], [])
        self.assertEqual(rows[0]['language_review_status'], 'clinical_languages_registered')
        self.assertEqual(rows[1]['language_review_status'], 'not_started')
        self.assertEqual(summary['facilitiesWithDirectoryWebsite'], 2)
        self.assertEqual(summary['uniqueDirectoryWebsiteUrls'], 1)
        self.assertFalse(summary['allTargetUrlsAttempted'])

    def test_contact_only_and_website_hold_are_not_clinical_positives(self):
        review = {'clinicId': '1', 'entries': [self.entry('contact_only', ['en'])]}
        row = report.describe(self.clinic(), None, review, False)
        self.assertEqual(row['language_review_status'], 'language_policy_registered')
        self.assertEqual(row['registered_clinical_languages'], '')
        row = report.describe(self.clinic(), None, review, True)
        self.assertEqual(row['language_review_status'], 'website_withheld_unrelated_destination')

    def test_suspended_services_and_explicit_japanese_only_are_not_multilingual_positives(self):
        review = {'clinicId': '1', 'entries': [self.entry('service_suspended', ['en'])]}
        row = report.describe(self.clinic(), None, review, False)
        self.assertEqual(row['language_review_status'], 'language_policy_registered')
        self.assertEqual(row['registered_clinical_languages'], '')
        review['entries'] = [self.entry('clinical_support', ['ja'])]
        row = report.describe(self.clinic(), None, review, False)
        self.assertEqual(row['language_review_status'], 'japanese_only_registered')

    def test_budget_exhaustion_and_retrieval_error_keep_their_reasons(self):
        row = report.describe(self.clinic(), {'pages': [], 'stopReason': 'time_budget', 'complete': False}, None, False)
        self.assertEqual(row['language_review_status'], 'not_started_time_budget')
        self.assertEqual(row['retrieval_or_manual_review_reasons'], 'time_budget')
        row = report.describe(self.clinic(), {'pages': [{'status': 'robots_unavailable', 'errorKind': 'http_error', 'httpStatus': 403}]}, None, False)
        self.assertIn('robots_unavailable:http_error:403', row['retrieval_or_manual_review_reasons'])

    def test_rejected_invalid_urls_are_processed_without_claiming_a_page_attempt(self):
        clinic = self.clinic()
        clinic['website'] = 'www.invalid.example'
        result = {'pages': [], 'complete': True, 'error': 'unsupported_url'}
        rows, summary = report.build_report([clinic], {clinic['website']: result}, [], [])
        self.assertTrue(summary['allTargetUrlsProcessed'])
        self.assertFalse(summary['allTargetUrlsAttempted'])
        self.assertEqual(summary['urlsAttempted'], 0)
        self.assertIn('unsupported_url', rows[0]['retrieval_or_manual_review_reasons'])

    def test_clinical_policy_is_shown_ahead_of_generic_homepage_navigation(self):
        result = {'pages': [
            {'url': 'https://example.com/', 'status': 'retrieved', 'textCharacters': 500,
             'candidates': ['Menu: English Privacy policy Translation']},
            {'url': 'https://example.com/foreign-patients', 'status': 'retrieved', 'textCharacters': 600,
             'candidates': ['We have no on-site medical interpreters. Please bring your own.']}], 'complete': True}
        row = report.describe(self.clinic(), result, None, False)
        self.assertIn('/foreign-patients', row['candidate_source_url_unreviewed'])
        self.assertIn('no on-site', row['candidate_quote_unreviewed'])
        self.assertEqual(row['registered_clinical_languages'], '')

    def test_duplicate_or_unexpected_results_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'results.gz'
            result = {'version': report.audit.VERSION, 'website': 'https://example.com/'}
            with gzip.open(path, 'wt') as output:
                output.write(json.dumps(result) + '\n')
            self.assertEqual(len(report.read_results([path], {'https://example.com/'})), 1)
            with self.assertRaises(ValueError):
                report.read_results([path, path], {'https://example.com/'})
            with self.assertRaises(ValueError):
                report.read_results([path], {'https://other.example/'})


if __name__ == '__main__':
    unittest.main()
