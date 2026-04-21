export function twitchPrimePage(params: { authenticated: boolean; channel: string }): string {
  const { authenticated, channel } = params;
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Twitch Prime</title></head>
<body>
  <p>Utilisateur : ${authenticated ? 'connecté' : 'non connecté - <a href="/twitch-prime/auth">se connecter</a>'}</p>
  <p>Chaîne surveillée : <strong>${channel || '(aucune)'}</strong></p>
  <form id="f">
    <input name="channel" placeholder="nom de la chaîne" value="${channel}" required>
    <button type="submit">Enregistrer</button>
  </form>
  <p id="msg"></p>
  <script>
    document.getElementById('f').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const res = await fetch('/twitch-prime/channel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: data.channel }),
      });
      document.getElementById('msg').textContent = res.ok ? 'Sauvegardé' : 'Erreur : ' + res.status;
    });
  </script>
</body>
</html>`;
}
