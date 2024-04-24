
const express = require('express');
const { spawn } = require('child_process');

const app = express();
const port = 4000;

// Route pour le flux vidéo
app.get('/', (req, res) => {
    // Spécifier les en-têtes pour le flux vidéo
    res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
    });

   // Démarrer raspivid pour capturer le flux vidéo et le rediriger vers ffmpeg pour la conversion en MP4
   const raspividProcess = spawn('raspivid', ['-t', '0', '-w', '640', '-h', '480', '-fps', '25', '-b', '2000000', '-o', '-']);
   const ffmpegProcess = spawn('ffmpeg', ['-i', '-', '-vcodec', 'copy', '-f', 'mp4', '-movflags', 'frag_keyframe+empty_moov', '-']);

   raspividProcess.stdout.pipe(ffmpegProcess.stdin);
   ffmpegProcess.stdout.pipe(res);


    // Gérer les erreurs
    raspividProcess.stderr.on('data', (data) => {
        console.error(`Erreur de raspivid : ${data}`);
    });

    raspividProcess.on('close', (code) => {
        console.log(`Le processus raspivid s'est arrêté avec le code de sortie ${code}`);
    });

    // Gérer la fin de la requête
    res.on('close', () => {
        console.log('Connexion client fermée');
        raspividProcess.kill(); // Arrêter raspivid lorsque la connexion client est fermée
        ffmpegProcess.kill(); // Arrêter ffmpeg également
    });
});

// Démarrer le serveur HTTP
app.listen(port, () => {
    console.log(`Serveur HTTP démarré sur le port ${port}`);
});
