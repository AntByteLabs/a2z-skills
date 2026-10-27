---
name: 'Websites & Hosting'
title: 'Cloudflare Workers domains and DNS troubleshooting'
description: 'Diagnose Cloudflare Workers custom-domain problems and understand DNS propagation, cached records and nameserver changes before changing the setup.'
order: 5
accent: '#c2622a'
startHere:
  - 'cloudflare-workers-custom-domain-not-working'
  - 'dns-propagation-explained'
---

For a Worker that does not answer on its domain, start with [the custom-domain checks](/cloudflare-workers-custom-domain-not-working/). The guide records the deployment and errors encountered during testing.

[DNS propagation explained](/dns-propagation-explained/) covers the difference between authoritative records and cached answers. Waiting for DNS and repairing an application are different jobs.

[Cloudflare SSL modes](/cloudflare-ssl-modes-explained/) explains the two connections in a proxied website and the certificate checks behind Full (strict).
