# Pooja Prime Realty website

A responsive, multi-page **static HTML website** built with HTML5, CSS3 and vanilla JavaScript. The only PHP file is `forms/enquiry.php`, which validates the contact form and emails submissions to the configured inbox. The firm's physical address is intentionally not published.

## Pages
- `index.html` — homepage and selected opportunities
- `about.html` — channel-partner overview and service principles
- `properties.html` — searchable/filterable property collection
- `ace-hive-business-suites.html` — ACE Hive project details
- `ace-edit.html` — ACE EDIT project details
- `cyberthum.html` — Cyberthum project details
- `services.html` — project discovery and enquiry support
- `contact.html` — contact details and enquiry form
- `privacy.html`, `terms.html` — starter legal pages to review before launch

## Hosting
- The public pages can be hosted on any ordinary static web host.
- The enquiry form requires PHP 8.0+ hosting for `forms/enquiry.php` and a working server-side `mail()` configuration.
- Upload the contents of this folder to your web root. `index.html` is the directory index.
- No database, PHP page templates, JavaScript framework or CSS framework is used.

## Configure enquiry email before launch
Open `forms/enquiry.php` and update these values near the top:

```php
$leadRecipient = 'rahulsanskar07@gmail.com';
$mailFrom = 'website@yourdomain.com'; // Replace with a real mailbox on your domain.
```

Keep `$leadRecipient` set to the inbox that should receive enquiries. Set `$mailFrom` to a valid email address on your own domain; many hosting providers reject sender addresses from unrelated domains. Make sure PHP `mail()` is enabled by your hosting provider, then submit a real test enquiry and verify delivery and spam-folder handling. The form will show an error rather than a false success if the sender address is still the example placeholder or mail sending fails.

The handler validates submitted fields, checks consent, uses a hidden honeypot field to reduce automated spam, and redirects back to the static contact page with a success/error status. Email delivery is not guaranteed until tested on the actual hosting server.

## Project content and images
The project pages use supplied ACE Hive, ACE EDIT and Cyberthum materials. Project prices and availability are not represented as current offers; confirm current information with the respective developer before publishing or relying on it. Replace or update the image assets only with approved material.

## Before launch
- [ ] Replace `example.com` in `robots.txt` and `sitemap.xml` with the live domain.
- [ ] Verify public phone number and email address.
- [ ] Configure `$mailFrom` and test real email delivery.
- [ ] Review the privacy policy, terms and consent wording for actual business practices.
- [ ] Confirm permission to publish supplied project images and brochures.
- [ ] Reconfirm project names, developer names, specifications, prices and availability.
- [ ] Test the website on mobile devices and major browsers.

## Technical notes
- `assets/css/styles.css` contains the responsive visual system.
- `assets/js/site.js` handles mobile navigation, property filtering, subtle reveal effects, and contact-page query/status behavior.
- `.htaccess` is optional on hosts that do not use Apache; configure equivalent security headers and directory-index behavior where supported.
