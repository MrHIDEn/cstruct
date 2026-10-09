```bash
git tag v1.9.0 && git push origin v1.9.0
```
```bash
gh release create v1.9.0 --title "v1.9.0" --generate-notes
```
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
