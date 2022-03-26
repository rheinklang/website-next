import type { Block, KnownBlock, MrkdwnElement, PlainTextElement } from '@slack/types';
// import { IncomingWebhook } from '@slack/webhook';
import axios from 'axios';
import Cookies from 'js-cookie';
import { CookieConsents } from '../utils/cookies';

if (!process.env.NEXT_PUBLIC_SLACK_REPORTING_WEBHOOK_URL || !process.env.NEXT_PUBLIC_SLACK_CONTACT_WEBHOOK_URL) {
	throw new Error('Missing Slack webhook URLs for contact and reporting');
}

const SLACK_REPORTING_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_REPORTING_WEBHOOK_URL;
const SLACK_CONTACT_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_CONTACT_WEBHOOK_URL;

/**
 * IncomingWebhook to send reports to Slack
 */
// const reportHook = new IncomingWebhook(process.env.NEXT_PUBLIC_SLACK_REPORTING_WEBHOOK_URL);

/**
 * IncomingWebhook to send contact submissions
 */
// const contactHook = new IncomingWebhook(process.env.NEXT_PUBLIC_SLACK_CONTACT_WEBHOOK_URL);

const transformFieldValueType = <T>(value: T): string => {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'boolean') {
		return value ? 'Yes' : 'No';
	}

	if (Array.isArray(value)) {
		return value.join(', ');
	}

	return JSON.stringify(value);
};

const getMetaBlocks = (): (Block | KnownBlock)[] => {
	const now = new Date();

	return [
		{
			type: 'section',
			fields: [
				{
					type: 'mrkdwn',
					text: `*Timestamp*`,
				},
				{
					type: 'plain_text',
					text: `${now.toLocaleDateString('de-DE')}, ${now.toLocaleTimeString('de-DE')}`,
				},
				{
					type: 'mrkdwn',
					text: `*Location*`,
				},
				{
					type: 'plain_text',
					text: `${document.location.href}`,
				},
				{
					type: 'mrkdwn',
					text: '*User-Agent*',
				},
				{
					type: 'plain_text',
					text: `${navigator.userAgent},`,
				},
				{
					type: 'mrkdwn',
					text: '*Build ID*',
				},
				{
					type: 'plain_text',
					text: `${process.env.BUILD_ID},`,
				},
			],
		},
		{
			type: 'section',
			fields: [
				{
					type: 'mrkdwn',
					text: '*Cookies*',
				},
				...Object.values(CookieConsents).map(
					(consent): MrkdwnElement => ({
						type: 'mrkdwn',
						text: `*${consent}* ${Cookies.get(consent) ? '✅' : '❌'}`,
					})
				),
			],
		},
	];
};

export async function sendReport(err?: any, scope = 'unknown') {
	const report = err instanceof Error ? err.message : `${err}`;

	await axios.post(
		SLACK_REPORTING_WEBHOOK_URL,
		{
			text: `:warning: Received new error report: ${report}`,
			blocks: [
				{
					type: 'section',
					fields: [
						{
							type: 'plain_text',
							text: `${scope}`,
						},
					],
				},
				...getMetaBlocks(),
			],
		},
		{
			withCredentials: false,
			transformRequest: [
				(data, headers) => {
					if (headers) {
						delete headers['Content-Type'];
					}
					return data;
				},
			],
		}
	);
}

export async function sendContactSubmission(formIdentifier: string, fields: Record<string, number | string | boolean>) {
	const readableFields = Object.entries(fields).map(([key, value]): [string, string] => [
		key,
		transformFieldValueType(value),
	]);

	const fieldSubmissions = readableFields.reduce(
		(prev, [key, value]) => [
			...prev,
			{
				type: 'mrkdwn' as const,
				text: `*${key}*`,
			},
			{
				type: 'plain_text' as const,
				text: `${value}`,
			},
		],
		[] as Array<MrkdwnElement | PlainTextElement>
	);

	await axios.post(
		SLACK_CONTACT_WEBHOOK_URL,
		{
			text: `:mailbox: New form submission from ${formIdentifier}`,
			blocks: [
				{
					type: 'section',
					fields: fieldSubmissions,
				},
				...getMetaBlocks(),
			],
		},
		{
			withCredentials: false,
			transformRequest: [
				(data, headers) => {
					if (headers) {
						delete headers['Content-Type'];
					}
					return data;
				},
			],
		}
	);
}
