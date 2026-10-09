<?php
declare(strict_types=1);

/*
 * The website itself is static HTML. This is the only PHP endpoint and is used
 * solely to validate enquiry submissions and email them to the business inbox.
 * Before launch, set these values to the real inbox and a sender on your domain.
 */
$leadRecipient = 'rahulsanskar07@gmail.com';
$mailFrom = 'website@yourdomain.com'; // CHANGE to a real mailbox on your website domain.
$brand = 'Pooja Prime Realty';
$contactPage = '../contact.html';

function redirect_to(string $url): never {
    header('Location: ' . $url, true, 303);
    exit;
}
function text_length(string $value): int {
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    redirect_to('../contact.html');
}

$name = trim((string)($_POST['name'] ?? ''));
$phone = trim((string)($_POST['phone'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$interest = trim((string)($_POST['interest'] ?? 'General enquiry'));
$message = trim((string)($_POST['message'] ?? ''));
$consent = (string)($_POST['consent'] ?? '');
$honeypot = trim((string)($_POST['company_website'] ?? ''));

// Silently accept honeypot submissions so automated spam does not learn the rule.
if ($honeypot !== '') {
    redirect_to('../contact.html?sent=1');
}

if (
    text_length($name) < 2 || text_length($name) > 100 ||
    !preg_match('/^[+0-9 ()-]{8,20}$/', $phone) ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) || text_length($email) > 160 ||
    text_length($interest) > 120 || text_length($message) < 10 ||
    text_length($message) > 2500 || $consent !== 'yes'
) {
    redirect_to('../contact.html?error=1');
}

if (
    !filter_var($leadRecipient, FILTER_VALIDATE_EMAIL) ||
    !filter_var($mailFrom, FILTER_VALIDATE_EMAIL) ||
    str_contains($mailFrom, 'yourdomain.com')
) {
    // Avoid falsely telling visitors that an email was sent before configuration.
    redirect_to('../contact.html?error=1');
}

$safeInterest = preg_replace('/[\r\n]+/', ' ', $interest) ?? 'General enquiry';
$subject = 'Website enquiry — ' . $safeInterest;
$body = "New enquiry from {$brand} website\n\n" .
    "Name: {$name}\nPhone: {$phone}\nEmail: {$email}\nInterest: {$safeInterest}\n\n" .
    "Message:\n{$message}\n";
$headers = [
    'From: ' . $brand . ' Website <' . $mailFrom . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

if (!@mail($leadRecipient, $subject, $body, implode("\r\n", $headers))) {
    redirect_to('../contact.html?error=1');
}
redirect_to('../contact.html?sent=1');
