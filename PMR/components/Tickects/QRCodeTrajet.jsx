import QRCode from 'react-native-qrcode-svg';

export default function QRCodeTrajet({ id }) {

    return <QRCode value={id} size={200} />;
}