"""Source-format regressions: never turn definitions, blanks or other clinics into facts."""
import pathlib
import sys
import unittest
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / 'scripts'))
from extract_nabii_access import parse_report, match_identity


def report(body):
    return ('<html><body>' + body + '</body></html>').encode()


class NabiiAccessTests(unittest.TestCase):
    def test_tooltip_definition_does_not_mean_insurance_designation(self):
        body = '''<button aria-controls="insurance">保険医療機関、公費負担医療機関及びその他の病院の種類</button>
        <div id="insurance"><div class="tooltipBlock"><table class="ptn6Item"><tr><td>保険医療機関</td></tr></table></div>
        <table class="ptn6Item"><tr><td>生活保護法指定医療機関</td></tr></table></div>'''
        self.assertFalse(parse_report(report(body))['japaneseInsuranceDesignation'])
        self.assertTrue(parse_report(report(body.replace('生活保護法指定医療機関', '保険医療機関')))['japaneseInsuranceDesignation'])

    def test_card_answer_must_be_explicit_and_unique(self):
        self.assertIsNone(parse_report(report('<p>クレジットカード決済：可能という項目の説明</p>'))['creditCard'])
        row = '<table><tr><th>クレジットカード決済</th><td>可能</td></tr></table>'
        self.assertEqual(parse_report(report(row + row))['creditCard'], '可能')
        self.assertIsNone(parse_report(report(row + row.replace('可能', '不可')))['creditCard'])
        self.assertEqual(parse_report(report(row.replace('可能', '-')))['creditCard'], '-')

    def test_department_scope_and_language_reservation_survive(self):
        def area(name, answer):
            return f'<div class="ptn3DataArea"><h3>◆{name}</h3><span class="annotation">初診時予約：未実施、予約外診察：{answer}、入院患者受入：不可</span></div>'
        body = area('内科', '不可') + area('皮膚科', '可能') + area('皮膚科', '可能')
        body += '''<div class="ptn1DataArea ptn9DataArea"><table><tr><th>対応可能な外国語名</th><td>英語</td></tr>
        <tr><th>予約</th><td>要予約</td></tr><tr><th>予約備考</th><td>英語外来は金曜のみ</td></tr></table></div>'''
        result = parse_report(report(body))
        self.assertEqual(result['departments'], [{'name': '内科', 'status': 'no'}, {'name': '皮膚科', 'status': 'yes'}])
        self.assertEqual(result['languageReservations'][0]['reservation'], '要予約')
        self.assertEqual(parse_report(report(area('内科', '-') + area('内科', '可能')))['departments'][0]['status'], 'unknown')
        without_timetable = area('美容外科', '不可').replace('ptn3DataArea', 'ptn1DataArea')
        unrelated = '<div class="ptn1DataArea"><h3>支払いの案内</h3><p>要確認</p></div>'
        self.assertEqual(parse_report(report(without_timetable + unrelated))['departments'], [{'name': '美容外科', 'status': 'no'}])

    def test_moved_renamed_or_conflicting_phone_is_held(self):
        clinic = {'name': {'ja': 'テスト医院'}, 'address': {'ja': '東京都港区芝１－２－３　２階'}, 'phone': '03-1111-2222'}
        identity = {'name': 'テスト医院', 'address': '東京都港区芝1-2-3 2階', 'phone': '(03)1111-2222'}
        self.assertIsNone(match_identity(clinic, identity))
        for field, replacement in [('name', '別医院'), ('address', '東京都港区芝1-2-4'), ('phone', '03-1111-9999')]:
            self.assertIsNotNone(match_identity(clinic, {**identity, field: replacement}))
        self.assertIsNone(match_identity(clinic, {**identity, 'phone': None}))
        self.assertIsNotNone(match_identity(clinic, {**identity, 'phone': None, 'address': '東京都港区芝1-2-3 3階'}))

    def test_truncated_document_is_rejected(self):
        with self.assertRaises(ValueError):
            parse_report(b'<html><body>partial')


if __name__ == '__main__':
    unittest.main()
