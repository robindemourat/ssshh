/**
 * Source : https://stackoverflow.com/questions/31161897/converting-audio-file-to-base64-using-javascript
 */
export default function getAudioAsBase64(audioFile, callback) {
    const reader = new FileReader();
    reader.onload = function(event) {
        // const data = event.target.result.split(',');
        callback(null, event.target.result);
    };
    reader.readAsDataURL(audioFile);
}