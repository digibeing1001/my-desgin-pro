// Content parser for Knowledge Base uploads
// Uses pdfjs-dist for PDFs, tesseract.js for image OCR
// Both are dynamically imported to reduce initial bundle size.

/**
 * Parse a PDF file and extract text content
 */
export async function parsePDF(file) {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    // Configure PDF.js worker (CDN fallback)
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    } catch {
      // Fallback: worker will be bundled if needed
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const pageCount = pdf.numPages;

    for (let i = 1; i <= Math.min(pageCount, 10); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return {
      type: 'pdf',
      name: file.name,
      status: 'parsed',
      pageCount,
      text: fullText.slice(0, 3000),
      excerpt: fullText.slice(0, 200),
      message: `已提取 ${pageCount} 页，${fullText.length} 字符`,
    };
  } catch (err) {
    return {
      type: 'pdf',
      name: file.name,
      status: 'error',
      message: `PDF 解析失败: ${err.message}`,
    };
  }
}

/**
 * Parse an image file with OCR
 */
export async function parseImage(file) {
  try {
    const { createWorker } = await import('tesseract.js');
    const imageUrl = URL.createObjectURL(file);
    const worker = await createWorker('chi_sim+eng', 1, {
      logger: () => {}, // silent
    });
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);

    return {
      type: 'image',
      name: file.name,
      status: 'parsed',
      text: text.slice(0, 3000),
      excerpt: text.slice(0, 200),
      message: text.trim() ? `OCR 识别完成，${text.length} 字符` : 'OCR 未识别到文字（可能为纯视觉内容）',
    };
  } catch (err) {
    return {
      type: 'image',
      name: file.name,
      status: 'error',
      message: `图片解析失败: ${err.message}`,
    };
  }
}

/**
 * Parse a text/markdown file
 */
export async function parseText(file) {
  try {
    const text = await file.text();
    return {
      type: 'text',
      name: file.name,
      status: 'parsed',
      text: text.slice(0, 3000),
      excerpt: text.slice(0, 200),
      message: `文本已提取，${text.length} 字符`,
    };
  } catch (err) {
    return {
      type: 'text',
      name: file.name,
      status: 'error',
      message: `文本解析失败: ${err.message}`,
    };
  }
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseFile(file) {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return parsePDF(file);
  }
  if (type.startsWith('image/')) {
    return parseImage(file);
  }
  if (type === 'text/markdown' || type === 'text/plain' || name.endsWith('.md') || name.endsWith('.txt')) {
    return parseText(file);
  }

  return {
    type: 'unknown',
    name: file.name,
    status: 'error',
    message: '暂不支持该文件格式，请上传 PDF、图片或文本文件',
  };
}
