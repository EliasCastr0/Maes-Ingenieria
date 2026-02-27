const { Resend } = require('resend');

// Usamos variables de entorno para máxima seguridad y flexibilidad
const resend = new Resend(process.env.RESEND_API_KEY || 're_KxZSryLs_pWdZmRqFaeXCjV8smMQKZTGW');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const { nombre, email, telefono, area, mensaje, fileName, fileContent } = data;

        // Aquí está el truco: Si no hay un nuevo mail configurado en Netlify, usa el tuyo por defecto.
        const recipientEmail = process.env.RECIPIENT_EMAIL || 'eliascastroinformatica@gmail.com';

        const response = await resend.emails.send({
            from: 'MAES Talento <onboarding@resend.dev>',
            to: recipientEmail,
            subject: `Nuevo CV: ${nombre} - ${area}`,
            html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px;">
            <h2 style="color: #00a8cc; border-bottom: 2px solid #00a8cc; padding-bottom: 10px;">Nueva postulación recibida</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email del postulante:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Área de interés:</strong> ${area}</p>
            <p style="background: #f4f4f4; padding: 15px; border-radius: 8px;"><strong>Mensaje:</strong><br>${mensaje || 'Sin mensaje'}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 0.8rem; color: #999;">Esta es una notificación automática del sistema MAES.</p>
        </div>
      `,
            attachments: [
                {
                    filename: fileName,
                    content: fileContent,
                }
            ]
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Email enviado con éxito', id: response.id })
        };
    } catch (error) {
        console.error('Error enviando mail:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Hubo un error al procesar el mensaje' })
        };
    }
};
