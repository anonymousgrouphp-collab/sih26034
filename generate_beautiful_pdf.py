from pathlib import Path
import re
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    ListFlowable,
    Table,
    TableStyle,
    KeepTogether,
    Preformatted,
)

SOURCE = Path(r"c:\Users\kunal\Desktop\NIRIKSHAK\PROJECT_MASTER_UNDERSTANDING_AND_JUDGE_PREPARATION.md")
OUT = Path(r"c:\Users\kunal\Desktop\NIRIKSHAK\docs\NIRIKSHAK_MASTER_JUDGE_GUIDE.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)


def clean_inline_markup(text: str) -> str:
    text = text.replace("&", "&amp;")
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\$\$([^$]+)\$\$", r"\1", text)
    text = re.sub(r"\$([^$]+)\$", r"\1", text)
    return text


def para_text(text: str) -> str:
    text = clean_inline_markup(text.strip())
    return text or " "


def render_story_from_markdown(md_text: str):
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleStyle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=30,
            textColor=colors.HexColor("#0f172a"),
            alignment=1,
            spaceAfter=12,
            spaceBefore=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubtitleStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            textColor=colors.HexColor("#475569"),
            alignment=1,
            spaceAfter=20,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionStyle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=20,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=18,
            spaceAfter=10,
            borderWidth=0,
            borderPadding=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SubSectionStyle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyStyle",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#111827"),
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QuoteStyle",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=9.8,
            leading=14,
            textColor=colors.HexColor("#475569"),
            leftIndent=12,
            borderPadding=6,
            borderColor=colors.HexColor("#cbd5e1"),
            borderWidth=0.8,
            borderLeftWidth=2,
            backColor=colors.HexColor("#f8fafc"),
            spaceBefore=8,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CodeStyle",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=8.5,
            leading=11,
            backColor=colors.HexColor("#f8fafc"),
            borderColor=colors.HexColor("#dbeafe"),
            borderWidth=0.8,
            borderPadding=8,
            spaceBefore=8,
            spaceAfter=8,
        )
    )

    story = []
    story.append(Spacer(1, 18 * mm))
    story.append(Paragraph("NIRIKSHAK", styles["TitleStyle"]))
    story.append(Paragraph("Complete Project Master Understanding & Judge Preparation Guide", styles["SubtitleStyle"]))
    story.append(Paragraph("Department of Consumer Affairs (DoCA), Government of India", styles["SubtitleStyle"]))
    story.append(Paragraph("Legal Metrology Act, 2009 • LMPC Rules, 2011 • BSA Section 63", styles["SubtitleStyle"]))
    story.append(Spacer(1, 12 * mm))
    story.append(PageBreak())

    lines = md_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if stripped.startswith("# "):
            title = stripped[2:]
            story.append(Paragraph(para_text(title), styles["SectionStyle"]))
            i += 1
            continue

        if stripped.startswith("## "):
            heading = stripped[3:]
            story.append(Paragraph(para_text(heading), styles["SubSectionStyle"]))
            i += 1
            continue

        if stripped.startswith("### "):
            heading = stripped[4:]
            story.append(Paragraph(para_text(heading), styles["BodyStyle"]))
            i += 1
            continue

        if stripped.startswith("> "):
            quote = stripped[2:]
            story.append(Paragraph(para_text(quote), styles["QuoteStyle"]))
            i += 1
            continue

        if stripped.startswith("```"):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(lines[i])
                i += 1
            if i < len(lines):
                i += 1
            code_text = "\n".join(code_lines)
            if code_text.strip():
                story.append(Preformatted(code_text, styles["CodeStyle"]))
            continue

        if re.match(r"^\|.*\|$", stripped):
            table_lines = [stripped]
            i += 1
            while i < len(lines) and re.match(r"^\|.*\|$", lines[i].strip()):
                table_lines.append(lines[i].strip())
                i += 1
            if len(table_lines) >= 3:
                table_rows = []
                for row in table_lines:
                    cells = [c.strip() for c in row.strip("|").split("|")]
                    if len(cells) == 0:
                        continue
                    table_rows.append(cells)
                if len(table_rows) >= 2:
                    headers = table_rows[0]
                    data_rows = table_rows[1:]
                    if len(headers) > 1:
                        table_data = [headers]
                        for row in data_rows:
                            if len(row) < len(headers):
                                row = row + [""] * (len(headers) - len(row))
                            table_data.append(row[: len(headers)])
                        table = Table(table_data, repeatRows=1)
                        style = TableStyle([
                            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                            ("VALIGN", (0, 0), (-1, -1), "TOP"),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                            ("FONTSIZE", (0, 0), (-1, -1), 7.2),
                            ("LEADING", (0, 0), (-1, -1), 8),
                        ])
                        table.setStyle(style)
                        story.append(KeepTogether(table))
                        story.append(Spacer(1, 5 * mm))
                        continue

        if stripped.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append(lines[i].strip()[2:].strip())
                i += 1
            if items:
                story.append(ListFlowable([Paragraph(para_text(item), styles["BodyStyle"]) for item in items], bulletType="bullet", bulletText="•", leftIndent=18, spaceBefore=4, spaceAfter=4, bulletFontName="Helvetica-Bold"))
                continue

        if re.match(r"^\d+\.\s", stripped):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                items.append(lines[i].strip()[re.match(r"^\d+\.\s", lines[i].strip()).end():].strip())
                i += 1
            if items:
                story.append(ListFlowable([Paragraph(para_text(item), styles["BodyStyle"]) for item in items], bulletType="1", leftIndent=18, spaceBefore=4, spaceAfter=4))
                continue

        # paragraph block
        para_lines = [stripped]
        i += 1
        while i < len(lines):
            nxt = lines[i].strip()
            if not nxt:
                break
            if nxt.startswith("#") or nxt.startswith("- ") or nxt.startswith("> ") or re.match(r"^\d+\.\s", nxt) or re.match(r"^\|.*\|$", nxt):
                break
            para_lines.append(nxt)
            i += 1
        text = " ".join(para_lines)
        if text.strip():
            story.append(Paragraph(para_text(text), styles["BodyStyle"]))

    return story


def build_pdf():
    text = SOURCE.read_text(encoding="utf-8")
    story = render_story_from_markdown(text)
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="NIRIKSHAK Complete Project Master Understanding & Judge Preparation Guide",
        author="NIRIKSHAK",
    )

    def on_first_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#0f172a"))
        canvas.rect(0, 0, A4[0], 12, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor("#e0f2fe"))
        canvas.rect(0, 12, A4[0], A4[1] - 12, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor("#0f172a"))
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(20 * mm, A4[1] - 12 * mm, "NIRIKSHAK • Judge Preparation Guide")
        canvas.restoreState()

    def on_later_pages(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor("#0f172a"))
        canvas.rect(0, 0, A4[0], 9, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor("#ffffff"))
        canvas.setFont("Helvetica", 8)
        canvas.drawString(20 * mm, 3.2 * mm, "NIRIKSHAK")
        canvas.drawRightString(A4[0] - 20 * mm, 3.2 * mm, str(doc.page))
        canvas.restoreState()

    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)


if __name__ == "__main__":
    build_pdf()
    print(f"Created PDF: {OUT}")
