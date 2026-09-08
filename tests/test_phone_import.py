import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('phones', Path(__file__).parents[1] / 'scripts/enrich_phones.py')
phones = importlib.util.module_from_spec(spec)
spec.loader.exec_module(phones)


class PhoneImportTest(unittest.TestCase):
    def test_phone_field_does_not_select_fax_reservation_or_staff_numbers(self):
        html = '''<table><tr><th>正式名称</th><td>テスト医院</td></tr>
        <tr><th>所在地</th><td>東京都墨田区横川１－１－１０</td></tr>
        <tr><th>案内用FAX番号</th><td>03-1111-2222</td></tr>
        <tr><th><label>案内用電話番号</label></th><td><a href="tel:0333334444">(03)3333-4444</a></td></tr>
        <tr><th>予約用電話番号</th><td>03-5555-6666</td></tr>
        <tr><th>担当部署の電話番号</th><td>03-7777-8888</td></tr></table>'''
        result = phones.parse_detail(html.encode())
        self.assertEqual(result['phone'], '(03)3333-4444')
        self.assertEqual(phones.normalized_phone(result['phone']), '03-3333-4444')
        no_guide = html.replace('案内用電話番号', '別項目')
        self.assertNotIn('phone', phones.parse_detail(no_guide.encode()))

    def test_duplicate_mobile_table_is_ok_but_conflicting_numbers_are_rejected(self):
        row = '<tr><th>案内用電話番号</th><td>03-3333-4444</td></tr>'
        self.assertEqual(phones.parse_detail((row + row).encode())['phone'], '03-3333-4444')
        self.assertNotIn('phone', phones.parse_detail((row + row.replace('4444', '5555')).encode()))

    def test_normalization_preserves_number_and_rejects_ambiguous_phone_values(self):
        self.assertEqual(phones.normalized_phone('（０３）６２５６－８９８１'), '03-6256-8981')
        self.assertEqual(phones.normalized_phone('0120-101-713'), '0120-101-713')
        for value in ('', '-', 'FAX 03-3333-4444', '03-3333-4444/03-5555-6666', '119'):
            self.assertIsNone(phones.normalized_phone(value))

    def test_same_name_in_another_town_does_not_match(self):
        self.assertNotEqual(phones.address_key('東京都墨田区横川１－１－１０'),
                            phones.address_key('〒187－0003小平市花小金井南町一丁目１３番７号'))
        self.assertFalse(phones.same_name('中央クリニック新宿院', '中央クリニック渋谷院'))

    def test_street_number_normalization_keeps_floor_digits_separate(self):
        self.assertEqual(phones.address_key('東京都荒川区荒川７－７－１８　１、２階'),
                         phones.address_key('〒116－0002荒川区荒川七丁目７番１８号　田中ビル１階、２階'))
        self.assertNotEqual(phones.address_key('東京都荒川区荒川７－７－１８'),
                            phones.address_key('東京都荒川区荒川７－７－１８１'))


if __name__ == '__main__':
    unittest.main()
