describe('Legacy credential cleanup', () => {
  afterEach(() => { localStorage.clear(); sessionStorage.clear(); vi.resetModules(); });
  it('removes persisted tokens on startup without restoring or contacting a session', async () => {
    localStorage.setItem('jhi-authenticationToken', 'obsolete-local-token');
    sessionStorage.setItem('jhi-authenticationToken', 'obsolete-session-token');
    vi.resetModules();
    const session = await import('./web-session');
    expect(localStorage.getItem('jhi-authenticationToken')).toBeNull();
    expect(sessionStorage.getItem('jhi-authenticationToken')).toBeNull();
    expect(session.getAccessToken()).toBeNull();
  });
});
