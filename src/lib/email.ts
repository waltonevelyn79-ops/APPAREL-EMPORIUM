import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function getTransporter() {
    const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_tls'] } }
    });

    const config: any = {};
    settings.forEach(s => config[s.key] = s.value);

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
        throw new Error("SMTP settings not configured properly. Configure via Admin Panel first.");
    }

    return nodemailer.createTransport({
        host: config.smtp_host,
        port: parseInt(config.smtp_port || '587'),
        secure: config.smtp_tls === 'SSL' || config.smtp_port === '465',
        auth: {
            user: config.smtp_user,
            pass: config.smtp_pass
        }
    });
}

export async function sendEmail(to: string, subject: string, html: string, templateKey?: string) {
    let finalHtml = html;

    // Inject global header/footer from settings
    const settings = await prisma.siteSetting.findMany({
        where: { key: { in: ['smtp_from', 'smtp_from_name', 'email_template_header', 'email_template_footer'] } }
    });
    const s: any = {};
    settings.forEach(setting => s[setting.key] = setting.value);

    const from = s.smtp_from ? `"${s.smtp_from_name || 'System'}" <${s.smtp_from}>` : process.env.DEFAULT_FROM_EMAIL;

    if (s.email_template_header && s.email_template_footer) {
        finalHtml = `${s.email_template_header}\n\n${html}\n\n${s.email_template_footer}`;
    }

    try {
        const transporter = await getTransporter();
        const info = await transporter.sendMail({ from, to, subject, html: finalHtml });

        await prisma.emailLog.create({
            data: { to, subject, status: 'sent', error: null }
        });

        return { success: true, messageId: info.messageId };
    } catch (err: any) {
        await prisma.emailLog.create({
            data: { to, subject, status: 'failed', error: err.message }
        });
        throw err;
    }
}

export function renderTemplate(templateString: string, variables: Record<string, string>) {
    let result = templateString || '';
    Object.entries(variables).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, val);
    });
    return result;
}
