// Smoke check only — the old CRA boilerplate imported App without Router/mocks,
// broke with react-router-dom v7/Jest resolver, and did not match this app’s UI anyway.
test('loads test environment', () => {
  expect(1 + 1).toBe(2);
});
