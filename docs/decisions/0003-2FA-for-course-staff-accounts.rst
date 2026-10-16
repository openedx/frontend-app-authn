3. 2FA for Course Team Accounts
-----------------------------------------

Status
------

Proposed

Context
-------

Course team accounts have a great deal of access to and control over sensitive information as well as the ability to run arbitrary Javascript on the LMS. An attacker who compromises an educator account could do a large amount of damage. To protect our learners (and our reputation) we should require 2FA or other enhanced account security for all accounts with these elevated permissions.

An attacker should find it difficult to gain access to the privileged aspects of an educator's account (even if in possession of their password).


Proposed Solutions
------------------

Option 1: Enable Two Factor Authentication (2FA)

Option 2: Ask users for their password before specific restricted actions on site

Option 3: Reset password after a specific time period


Decision
--------

We have decided to go with Option 1. We will enable **Two Factor Authentication** (2FA) for user accounts that belong to course teams (in some cases these can be staff accounts as well).

This change can be accommodated within our current login flow. A high level flow of this process is as follow:

- A user belonging to a course team will authenticate themselves like they currently do, either by providing login credentials or by SSO.
- Once they have authenticated successfully they will be authenticated by a 2FA method
- After successful verification of 2FA code, assign a session to user.

Why choose 2FA?
***************

- It is a conventional way to secure user accounts.
- We can protect staff users at the first step they take on our site i.e authentication.
- Development wise it will not require extensive effort as compared to the second option.


Two Factor Authentication approaches
************************************

- Email Token
- Sms Token
- Push Based 2FA
- TOTP
- U2F Security Keys


Comparison
**********

.. list-table:: **Comparison of 2FA methods**
   :widths: 10 15 15 15
   :header-rows: 1
   :stub-columns: 1

   * - Types
     - Intro
     - Pros
     - Cons
   * - Email Token
     - Send a token to the registered email address and verify the token, during login.
     - - Works fine if the email is secured
       - Extra device not needed
       - We already have user email so we will not be requiring any personal information from the user.
     - - Vulnerable if password is reused. (most users keep same password)
       - Vulnerable if device is compromised (malware attack)
       - Not secured as other 2FA methods.
       - Email delivery concern.
   * - SMS Token
     - Send a token to the registered mobile number and verify the token, during login.
     - - No need to install extra app
       - Works fine if mobile network is not ported
     - - Vulnerable to targeted attacks like social engineering and number porting etc.
       - Requires a cell phone.
       - Privacy concern (people not comfortable giving phone number)
       - Cannot use if phone is dead or unable to reach signals
       - We will be getting a mobile phone number ( a new info) so we will be needing compliance approval.
   * - Push Based
     - Send a push notification on your trusted device, the prompt will ask for accept and denial.
     - - Secured
       - Convenient
       - Time saving
     - - Cannot use single app for multiple sites
       - Requires signal and connection
       - Cannot use if phone is dead
       - Requires custom integrations from providers.
   * - U2F
     - Using small USB, NFC or Bluetooth Low Energy (BTLE) devices often called “security keys.” To set it up on a site, you register your U2F device. And then tap on the device when logging in.
     - - Secured
       - Can use same U2F device for multiple sites
     - - Needs a device
       - Cost
       - Support (only chrome supports U2F currently)
       - NFC only available on android mobiles
       - Vulnerable to physical theft of device.
   * - TOTP
     - Use an authenticator app on another phone to generate time-based codes locally based on secret keys.
     - - Secured
       - Generate codes locally
       - Time based code (valid for some seconds)
       - Standardized
       - Does Not require signal or connection therefore not vulnerable to social engineering attacks like number porting.
       - Some authenticator apps do not require a mobile device either.
       - Does not require any personal information from user.
     - - Cannot use if phone is dead
       - Not convenient (need to type code within a time frame)
       - Vulnerable if the mobile is compromised and TOTP for the website has been set up on the same mobile with the app.


Preferred Method
----------------

We have **TOTP** (Time-based on time password) as preferred two-factor authentication method.

**TOTP**
    TOTP stands for Time-based One-Time Passwords and is a common form of two factor authentication (2FA). Unique numeric passwords are generated with a standardized algorithm that uses the current time as an input. The time-based passwords are available offline and provide user friendly, increased account security when used as a second factor. (ref).


Issues with previous approach
------------------------------

Previously our approach was to either reduced session expiration time or go with 2FA and Password reset after some time simultaneously but there were some problems with this approach:

- Reducing session expiration to 2 weeks from 4 weeks was not making a big difference and if we reduce it to 1 day then it was an issue for course teams since they are normally making changes that might span over a few days and they might lose those edit if they don't save them as draft.

- Resetting passwords often makes people more likely to pick simple passwords. Also we should avoid doing password resets except in cases of known compromise.

Based on these reasoning, we decided to look into other kinds of 2FA.


Consequences
************

Adds an additional step for some users which can negatively affect the user experience.


References
----------

Corresponding Security Ticket:
https://2u-internal.atlassian.net/browse/SEG-96

Detailed analysis of all security enhancements options provided above can be found here:
https://openedx.atlassian.net/l/c/3HKHjZY4

Analysis of other kinds of 2FA:
https://docs.google.com/document/d/1oNtUNbu71DBvznIVbxiOJbVMToTZqkCoiT-5VMIjqWg/edit?usp=sharing