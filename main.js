// App de desktop do RORDENS For People: abre rordens.ai/people numa janela própria (Dock no Mac, barra de tarefas no Windows).
// Mesma conta e mesmos dados do site. O conteúdo vem do site, então o app não precisa ser reinstalado a cada melhoria.
const { app, BrowserWindow, Menu, shell, session } = require('electron');
const path = require('node:path');

const INICIO = 'https://rordens.ai/people';
// Só estes endereços abrem dentro do app; qualquer outro vai para o navegador do sistema.
const DENTRO = [/^https:\/\/rordens\.ai(\/|$)/, /^https:\/\/[a-z0-9-]+\.supabase\.co(\/|$)/, /^https:\/\/checkout\.stripe\.com(\/|$)/, /^https:\/\/billing\.stripe\.com(\/|$)/];
const dentro = (url) => DENTRO.some((re) => re.test(url));

if (!app.requestSingleInstanceLock()) app.quit();
let janela = null;
app.on('second-instance', () => {
  if (janela) {
    if (janela.isMinimized()) janela.restore();
    janela.focus();
  }
});

function criarJanela() {
  janela = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'RORDENS',
    // Ícone da janela e da barra de tarefas (no Windows o executável sai sem ícone próprio).
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true },
  });
  // O site reconhece o app por este sufixo (esconde o botão "Instalar app").
  janela.webContents.setUserAgent(`${janela.webContents.getUserAgent()} RORDENSApp`);
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (dentro(url)) return { action: 'allow' };
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  janela.webContents.on('will-navigate', (e, url) => {
    if (dentro(url)) return;
    e.preventDefault();
    if (url.startsWith('https://')) void shell.openExternal(url);
  });
  // O título da janela é sempre RORDENS (a página traz outros títulos conforme a tela).
  janela.on('page-title-updated', (e) => e.preventDefault());
  void janela.loadURL(INICIO);
  janela.on('closed', () => {
    janela = null;
  });
}

app.whenReady().then(() => {
  // Liberar arquivos usa a API de pastas do Chromium; a permissão é do usuário no popup do próprio RORDENS.
  session.defaultSession.setPermissionRequestHandler((wc, permissao, ok) => ok(permissao === 'fileSystem' || permissao === 'clipboard-sanitized-write'));
  session.defaultSession.setPermissionCheckHandler((wc, permissao) => permissao === 'fileSystem' || permissao === 'clipboard-sanitized-write');
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
    ]),
  );
  criarJanela();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
