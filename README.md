# GetProspect for Twenty

Find and verify business emails, and enrich People and Companies in Twenty with [GetProspect](https://getprospect.com) data.

## What it does

**Enrich new records automatically.** Two workflows run as soon as the app is installed:

- **Enrich new people (GetProspect):** looks up every new person by email, LinkedIn URL, or name + company domain, and fills in name, job title and LinkedIn when they are empty, plus seniority, departments and location. A person without a company is linked to their employer's company, which is created when it does not exist yet.
- **Enrich new companies (GetProspect):** looks up every new company by domain, LinkedIn URL or name, and fills in address, LinkedIn and website when they are empty, plus employees, industry, AI industries, status, business model, revenue stream, keywords, description, founded year, offices, technologies and the enrichment date.

Imports count as new records, so a CSV import is enriched too. You can turn either workflow off in **Workflows**.

**Act on selected records** from the record menu (Cmd+K on a person or company, or the selection bar):

| Action | Object | What it writes |
|---|---|---|
| Find Emails (GetProspect) | People | A verified business email from name + company. Never overwrites a primary email; a found address is added as an extra email. |
| Verify Emails (GetProspect) | People | Email status (Valid, Accept-all, Invalid, Unknown) of the primary email. |
| Enrich (GetProspect) | People, Companies | The enrichment fields above, for up to 25 records at a time. |

All four are also available as **workflow steps** and to **Twenty's AI chat**.

Fields you already filled in (name, job title, LinkedIn, address, website) are never replaced. The GetProspect fields always show the latest data.

## Setup

1. Install the app from **Settings > Applications > Marketplace**.
2. In GetProspect, copy your API key from **Settings > API** ([app.getprospect.com](https://app.getprospect.com)).
3. In Twenty, open **Settings > Applications > GetProspect** and paste the key into **GetProspect API key**.

Requires Twenty 2.57 or later.

Try it: add a person with only a business email. Within a minute their name, job title and LinkedIn appear, and their company is enriched.

## Pricing

The app is free. Lookups use your GetProspect account:

- **Enrichment** (people and companies, including the automatic workflows) spends **no credits**. The app never asks GetProspect to reveal an email or phone while enriching.
- **Find Emails**: 1 email credit per new email found. Not-found results and emails your GetProspect workspace already has are free.
- **Verify Emails**: 1 verification credit per Valid, Invalid or Accept-all result. Unknown results are free.

See [GetProspect pricing](https://getprospect.com/pricing) for plans and free credits.

## Privacy

To look records up, the app sends these values from your Twenty workspace to the GetProspect API (`api.getprospect.com`), over HTTPS, authenticated with your API key:

- for people: email, LinkedIn URL, first and last name, company domain or name;
- for companies: domain, LinkedIn URL or name.

Nothing else leaves your workspace, and no AI provider is involved. GetProspect records the lookups on your GetProspect account (for credits, rate limits and its request log) under the [GetProspect privacy policy](https://getprospect.com/privacy) and [terms](https://getprospect.com/terms). To have that data deleted, contact support@getprospect.com. Removing the app from Twenty stops all lookups; values already written to your records stay until you delete them.

## Limits

- Up to 25 records per manual action, 5 looked up at a time. The automatic workflows run one record each.
- GetProspect rate limits apply. When GetProspect asks to slow down, the app waits briefly and retries; a longer limit stops the run with a message.
- A live email search can take up to about 90 seconds per person.

## Support

- Email: support@getprospect.com
- Issues: [github.com/newlab-io/getprospect-twenty-app/issues](https://github.com/newlab-io/getprospect-twenty-app/issues)
