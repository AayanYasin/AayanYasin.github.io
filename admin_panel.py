import sys
import os
import json
import webbrowser
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QLabel, QLineEdit, QTextEdit, 
                             QPushButton, QComboBox, QMessageBox, QStackedWidget,
                             QFrame, QTabWidget)
from PyQt5.QtCore import Qt
from git import Repo

# --- DYNAMIC PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_PATH = BASE_DIR 
DATA_FILE_PATH = os.path.join(REPO_PATH, "projects.js")
INDEX_PATH = os.path.join(REPO_PATH, "index.html")
ADMIN_PASSWORD = "A10485766a"

class AdminApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("AY CMS | AUTO-SYNC EDITION")
        self.setMinimumSize(1200, 900)
        
        self.setStyleSheet("""
            QMainWindow { background-color: #050508; }
            QWidget { font-family: 'JetBrains Mono', 'Segoe UI'; color: #e4e4e7; }
            #Sidebar { background-color: #0d0d14; border-right: 2px solid #1a1a24; min-width: 260px; }
            QLineEdit, QComboBox { 
                background-color: #161620; border: 1px solid #27272a; 
                color: #60a5fa; padding: 12px; border-radius: 6px; font-weight: bold;
            }
            QTextEdit { 
                background-color: #0a0a0f; border: 1px solid #27272a; 
                color: #e4e4e7; font-size: 14px; border-radius: 8px;
            }
            QTabWidget::pane { border: 1px solid #1a1a24; background: #0d0d14; border-radius: 8px; }
            QTabBar::tab { background: #161620; padding: 10px 20px; border-top-left-radius: 8px; border-top-right-radius: 8px; margin-right: 2px; }
            QTabBar::tab:selected { background: #3b82f6; color: white; }
            #PrimaryBtn { background-color: #3b82f6; color: white; border: none; font-weight: 800; height: 50px; border-radius: 8px; }
            #PublishBtn { background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #3b82f6, stop:1 #a855f7); color: white; border: none; height: 45px; border-radius: 6px; }
        """)

        self.central_widget = QStackedWidget()
        self.setCentralWidget(self.central_widget)
        self.init_login_ui()
        self.init_main_ui()

    def init_login_ui(self):
        page = QWidget(); layout = QVBoxLayout(page)
        card = QFrame(); card.setFixedSize(400, 300); card.setStyleSheet("background: #0d0d14; border-radius: 15px; border: 1px solid #1a1a24;")
        cl = QVBoxLayout(card); cl.setContentsMargins(40,40,40,40)
        self.pass_input = QLineEdit(); self.pass_input.setPlaceholderText("SECURITY TOKEN"); self.pass_input.setEchoMode(QLineEdit.Password)
        btn = QPushButton("INITIALIZE"); btn.setObjectName("PrimaryBtn"); btn.clicked.connect(self.check_login)
        cl.addWidget(QLabel("CORE ACCESS"), alignment=Qt.AlignCenter); cl.addWidget(self.pass_input); cl.addWidget(btn)
        layout.addWidget(card, alignment=Qt.AlignCenter)
        self.central_widget.addWidget(page)

    def init_main_ui(self):
        main_page = QWidget(); layout = QHBoxLayout(main_page); layout.setContentsMargins(0,0,0,0)

        # --- SIDEBAR ---
        sidebar = QFrame(); sidebar.setObjectName("Sidebar"); sl = QVBoxLayout(sidebar)
        sl.setContentsMargins(20,40,20,40)
        btn_prev = QPushButton("Preview Site"); btn_prev.clicked.connect(self.run_preview)
        btn_pub = QPushButton("DEPLOY TO LIVE"); btn_pub.setObjectName("PublishBtn"); btn_pub.clicked.connect(self.git_push)
        sl.addWidget(QLabel("AY PORTFOLIO"), alignment=Qt.AlignCenter); sl.addWidget(btn_prev); sl.addStretch(); sl.addWidget(btn_pub)

        # --- EDITOR SPACE ---
        content = QWidget(); cl = QVBoxLayout(content); cl.setContentsMargins(40,40,40,40)
        
        row1 = QHBoxLayout()
        self.cat_select = QComboBox(); self.cat_select.addItems(['erp', '3d', 'retail', 'web', 'games', 'mobile'])
        self.title_input = QLineEdit(); self.title_input.setPlaceholderText("Project Name...")
        row1.addWidget(self.cat_select, 1); row1.addWidget(self.title_input, 3)

        self.desc_input = QLineEdit(); self.desc_input.setPlaceholderText("Short Tagline...")

        # THE TABBED EDITOR WITH CONVERSION LOGIC
        self.tabs = QTabWidget()
        self.visual_editor = QTextEdit()
        self.code_editor = QTextEdit()
        self.tabs.addTab(self.visual_editor, "VISUAL (WYSIWYG)")
        self.tabs.addTab(self.code_editor, "SOURCE (HTML)")
        
        # This is the "magic" line that converts when you click the tab
        self.tabs.currentChanged.connect(self.sync_editors)

        self.images_input = QLineEdit(); self.images_input.setPlaceholderText("Image URLs (comma separated)...")
        self.down_input = QLineEdit(); self.down_input.setPlaceholderText("Resource Link...")

        btn_save = QPushButton("SAVE CHANGES"); btn_save.setObjectName("PrimaryBtn"); btn_save.clicked.connect(self.save_project)

        cl.addLayout(row1); cl.addWidget(self.desc_input); cl.addWidget(QLabel("PROJECT CONTENT"))
        cl.addWidget(self.tabs); cl.addWidget(self.images_input); cl.addWidget(self.down_input); cl.addWidget(btn_save)

        layout.addWidget(sidebar); layout.addWidget(content)
        self.central_widget.addWidget(main_page)

    # --- THE SYNC LOGIC ---
    def sync_editors(self, index):
        """Automatically converts between Visual and HTML formats on tab switch"""
        if index == 1: # Switching to HTML Source Code
            html_content = self.visual_editor.toHtml()
            self.code_editor.setPlainText(html_content)
        else: # Switching back to Visual Writer
            raw_html = self.code_editor.toPlainText()
            self.visual_editor.setHtml(raw_html)

    def check_login(self):
        if self.pass_input.text() == ADMIN_PASSWORD: self.central_widget.setCurrentIndex(1)
        else: QMessageBox.critical(self, "DENIED", "Invalid Token.")

    def save_project(self):
        try:
            # Ensure the latest data is synced before saving
            self.sync_editors(self.tabs.currentIndex())
            
            with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
            
            json_str = content.replace("const projectData = ", "").strip().rstrip(";")
            data = json.loads(json_str)

            # We always save the HTML version for the website
            final_content = self.code_editor.toPlainText() if self.tabs.currentIndex() == 1 else self.visual_editor.toHtml()

            new_item = {
                "title": self.title_input.text(),
                "desc": self.desc_input.text(),
                "fullDesc": final_content, 
                "images": [img.strip() for img in self.images_input.text().split(',') if img.strip()],
                "downloadUrl": self.down_input.text() or "#"
            }

            data[self.cat_select.currentText()]['items'].append(new_item)

            with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
                f.write(f"const projectData = {json.dumps(data, indent=4)};")
            
            QMessageBox.information(self, "SUCCESS", "Project Saved.")
            self.clear_form()
        except Exception as e: QMessageBox.critical(self, "FAILED", str(e))

    def git_push(self):
        try:
            repo = Repo(REPO_PATH); repo.git.add(A=True)
            repo.index.commit("Portfolio Update: Dynamic Content Sync")
            repo.remotes.origin.push()
            QMessageBox.information(self, "LIVE", "Website Updated.")
        except Exception as e: QMessageBox.critical(self, "ERROR", str(e))

    def run_preview(self): webbrowser.open(f"file:///{INDEX_PATH}")
    
    def clear_form(self):
        for w in [self.title_input, self.desc_input, self.visual_editor, self.code_editor, self.images_input, self.down_input]: w.clear()

if __name__ == "__main__":
    app = QApplication(sys.argv); window = AdminApp(); window.show()
    sys.exit(app.exec_())