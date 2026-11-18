"""Check downloaded documents as rendered pages, including text/image overlap."""
import json
import re
from pathlib import Path
import pymupdf

root = Path(__file__).resolve().parents[2] / 'storage/app/browser-test-results'
state = json.loads((root / 'json/full-system-state.json').read_text(encoding='utf-8'))
expectations = state.get('pdfExpectations', [])
assert expectations, 'No PDF evidence captured by the current QA run'
results = []

def normalized(text):
    return re.sub(r'\s+', ' ', text).strip()

for expected in expectations:
    document = pymupdf.open(root / 'pdf' / expected['file'])
    assert expected['number'] in ' '.join(page.get_text() for page in document), 'Missing invoice number'
    # Exclude repeated page furniture when checking text that continues over a page break.
    page_texts = []
    for page in document:
        content = page.get_text().replace('INVOICE\nNo. ' + expected['number'] + '\n', '')
        content = re.sub(r'\n\d+\s*$', '', content)
        page_texts.append(content)
    text = normalized(' '.join(page_texts))
    for value in [expected['invoice'], expected['client'], expected['account'],
                  *expected['descriptions'], expected.get('terms')]:
        if value:
            assert normalized(value) in text, f"{expected['file']}: lost or clipped text: {value[:100]}"
    if expected['singlePage']:
        assert len(document) == 1, f"{expected['file']}: expected one A4 page"
    image_count = 0
    for index, page in enumerate(document):
        page_text = normalized(page.get_text())
        if any(normalized(description) in page_text for description in expected['descriptions'] if description):
            assert 'Item Description' in page_text, f"{expected['file']}: item row separated from its column header"
        assert abs(page.rect.width - 595.28) < 1 and abs(page.rect.height - 841.89) < 1, 'Expected A4'
        spans = []
        for block in page.get_text('dict')['blocks']:
            if 'lines' in block:
                for line in block['lines']:
                    for span in line['spans']:
                        if span['text'].strip():
                            rect = pymupdf.Rect(span['bbox'])
                            assert rect.x0 >= -1 and rect.x1 <= page.rect.width + 1, f"{expected['file']}: horizontal text clipping"
                            assert rect.y0 >= -1 and rect.y1 <= page.rect.height + 1, f"{expected['file']}: vertical text clipping"
                            spans.append((normalized(span['text']), rect))
        signer_rects = [rect for value, rect in spans if value in [expected['signer'], expected['position'], expected['company']]]
        footer_rects = [rect for value, rect in spans if rect.y0 > 750 and (value == 'INVOICE' or value == 'No. ' + expected['number'])]
        for value, rect in spans:
            if value not in ['INVOICE', 'No. ' + expected['number']] and not value.isdigit():
                for footer in footer_rects:
                    intersection = rect & footer
                    assert intersection.is_empty or intersection.width < 1 or intersection.height < 1, f"{expected['file']}: footer overlaps body: {value}"
        for value, rect in spans:
            if value not in [expected['signer'], expected['position'], expected['company']]:
                for signer in signer_rects:
                    intersection = rect & signer
                    assert intersection.is_empty or intersection.width < 1 or intersection.height < 1, f"{expected['file']}: signer overlaps other text: {value}"
        for image in page.get_images():
            image_count += 1
            for bounds in page.get_image_rects(image):
                if bounds.width > page.rect.width * .8 or bounds.height > page.rect.height * .8:
                    continue  # Full-page background artwork is intentional.
                for signer in signer_rects:
                    intersection = bounds & signer
                    assert intersection.is_empty or intersection.width < 1 or intersection.height < 1, f"{expected['file']}: artwork covers signer text"
        page.get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(root / 'pdf' / f"{Path(expected['file']).stem}-page-{index+1}.png")
    assert image_count >= 3, f"{expected['file']}: missing branding/signature artwork"
    results.append({'file': expected['file'], 'pages': len(document), 'images': image_count, 'passed': True})
    print('PASS PDF', expected['file'], len(document), 'pages')

(root / 'json/pdf-verification.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
