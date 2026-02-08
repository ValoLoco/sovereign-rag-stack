"""Document processing with support for multiple formats.

Handles PDF, Markdown, DOCX, and code files.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)


class DocumentProcessor:
    def __init__(self):
        self.supported_extensions = {".txt", ".md", ".pdf", ".docx", ".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"}
    
    def process_file(self, file_path: str) -> Dict[str, Any]:
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        extension = path.suffix.lower()
        
        if extension not in self.supported_extensions:
            logger.warning(f"Unsupported file type: {extension}. Treating as plain text.")
            return self._process_text(path)
        
        processors = {
            ".txt": self._process_text,
            ".md": self._process_markdown,
            ".pdf": self._process_pdf,
            ".docx": self._process_docx,
        }
        
        if extension in {".py", ".js", ".ts", ".java", ".cpp", ".c", ".go", ".rs"}:
            return self._process_code(path)
        
        processor = processors.get(extension, self._process_text)
        return processor(path)
    
    def _process_text(self, path: Path) -> Dict[str, Any]:
        text = path.read_text(encoding="utf-8")
        
        return {
            "text": text,
            "metadata": {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "extension": path.suffix,
                "type": "text",
                "size": len(text)
            }
        }
    
    def _process_markdown(self, path: Path) -> Dict[str, Any]:
        text = path.read_text(encoding="utf-8")
        
        lines = text.split("\n")
        title = None
        
        for line in lines:
            if line.startswith("# "):
                title = line[2:].strip()
                break
        
        return {
            "text": text,
            "metadata": {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "extension": path.suffix,
                "type": "markdown",
                "title": title,
                "size": len(text)
            }
        }
    
    def _process_pdf(self, path: Path) -> Dict[str, Any]:
        try:
            import pypdf
        except ImportError:
            logger.error("pypdf not installed. Install with: pip install pypdf")
            raise ImportError("Install pypdf: pip install pypdf")
        
        text_parts = []
        
        with open(path, "rb") as f:
            reader = pypdf.PdfReader(f)
            num_pages = len(reader.pages)
            
            for page_num, page in enumerate(reader.pages, 1):
                text_parts.append(page.extract_text())
        
        text = "\n\n".join(text_parts)
        
        return {
            "text": text,
            "metadata": {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "extension": path.suffix,
                "type": "pdf",
                "pages": num_pages,
                "size": len(text)
            }
        }
    
    def _process_docx(self, path: Path) -> Dict[str, Any]:
        try:
            import docx
        except ImportError:
            logger.error("python-docx not installed. Install with: pip install python-docx")
            raise ImportError("Install python-docx: pip install python-docx")
        
        doc = docx.Document(str(path))
        text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
        text = "\n\n".join(text_parts)
        
        return {
            "text": text,
            "metadata": {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "extension": path.suffix,
                "type": "docx",
                "paragraphs": len(text_parts),
                "size": len(text)
            }
        }
    
    def _process_code(self, path: Path) -> Dict[str, Any]:
        text = path.read_text(encoding="utf-8")
        
        language_map = {
            ".py": "python",
            ".js": "javascript",
            ".ts": "typescript",
            ".java": "java",
            ".cpp": "cpp",
            ".c": "c",
            ".go": "go",
            ".rs": "rust"
        }
        
        return {
            "text": text,
            "metadata": {
                "filename": path.name,
                "filepath": str(path.absolute()),
                "extension": path.suffix,
                "type": "code",
                "language": language_map.get(path.suffix, "unknown"),
                "lines": len(text.split("\n")),
                "size": len(text)
            }
        }
    
    def process_directory(self, directory_path: str, recursive: bool = True) -> List[Dict[str, Any]]:
        path = Path(directory_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        if not path.is_dir():
            raise ValueError(f"Not a directory: {directory_path}")
        
        results = []
        
        if recursive:
            files = path.rglob("*")
        else:
            files = path.glob("*")
        
        for file_path in files:
            if file_path.is_file() and file_path.suffix.lower() in self.supported_extensions:
                try:
                    result = self.process_file(str(file_path))
                    results.append(result)
                    logger.info(f"Processed: {file_path.name}")
                except Exception as e:
                    logger.error(f"Error processing {file_path}: {e}")
        
        return results


def get_document_processor() -> DocumentProcessor:
    return DocumentProcessor()
