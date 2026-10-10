# Flow publikacji do npmjs

Pipeline (.github/workflows/npm-publish.yml) startuje na `release created`. Sam push tagu nie wystarczy - musi byc release (albo workflow_dispatch recznie).
Tag stawiam na merge commitcie do main, w ktorym jest juz bump wersji w package.json. Checkout przy release pointsuje na commit z taga, wiec publikowany jest dokladnie ten kod co otagowany.

## Kroki

1. pisze zmiany na galezi, zmieniam wersje w kodzie (package.json) na nowa
2. scalam to z main (PR, merge)
3. ustawiam tagi i push na main:
```bash
git tag v1.9.0 && git push origin v1.9.0
```

4. tworze release - to jest wlasciwy trigger pipeline'u:
```bash
gh release create v1.9.0 --title "v1.9.0" --generate-notes
```

5. pipeline akcji majac klucz `NPM_TOKEN` sam publikuje na npmjs:
   - `action` `.github/workflows/npm-publish.yml`
   - job `test`: `npm ci` + `npm test` (jak testy padna, publikacja nie ruszy)
   - job `publish-npm`: `npm publish --access public` z `NODE_AUTH_TOKEN: secrets.NPM_TOKEN`

# Nie uzywane. Obecnie jesli tylko masz na repo NPM_TOKEN on npmjs
```bash
npm login
npm whoami
```
```bash
npm publish --dry-run
```
publishConfig ma już access: public, więc nie trzeba dodawać flagi. `npm publish --access public`
```bash
npm publish
```

```bash
npm logout
```