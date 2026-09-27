# VrikshaHire — React frontend

## Run it
```
npm install
npm run dev
```
Opens on http://localhost:5173 (Vite's default). Your backend must be running
separately on port 5000 (node server.js) at the same time.

## Files that matter (read in this order)

1. **src/api/api.js** — the ONLY file that calls fetch(). Every page imports
   functions from here instead of calling fetch() directly. This mirrors
   exactly what you did in Thunder Client: same URLs, same JSON body, same
   Authorization: Bearer header for protected routes.

2. **src/pages/Login.jsx** and **Signup.jsx** — a form + useState + one
   function that calls api.js and either saves the token or shows an error.

3. **src/pages/Dashboard.jsx** — loads jobs/notices on page load (useEffect),
   and calls applyToJob() when you click Apply.

4. **src/App.jsx** — decides which of the three pages above is currently
   showing. No routing library — just one variable holding "login" /
   "signup" / "dashboard".

## One thing you need to fix: studentId

Your backend's /api/application route expects a real studentId (a MongoDB
_id) in the request body. Right now App.jsx passes `studentId={null}` to
Dashboard, which will break the Apply button.

The real fix: when login() succeeds, your backend's JWT payload already
contains { id: student._id } (see your auth.js generatetoken call). You can
decode that ID out of the token client-side, or — simpler for a 2-3 hour
build — change your login route to also return the student's id directly
in the response JSON, then store it in localStorage next to the token.

This is deliberately left for you to wire up rather than done for you.

## Why localStorage for the token

localStorage is a small key-value store the browser keeps per website. It
persists across page refreshes (unlike a plain JS variable, which resets).
The token itself is what proves who you are — not the password, which
never leaves the login form after the initial request. Every protected
request reads the token back out and sends it as a header, same as you
did by hand in Thunder Client's Auth tab.
