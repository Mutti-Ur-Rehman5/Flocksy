// Shared auth cookie options.
// In production the frontend (Vercel) and backend (Render) are different origins,
// so the JWT cookie must be cross-site capable (SameSite=None + Secure).
// In local development keep SameSite=Strict and Secure=false so nothing changes locally.
const isProduction = () =>
    process.env.NODE_ENV === "production" || !!process.env.CLIENT_URL;

export const cookieOptions = () => ({
    httpOnly: true,
    maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
    secure: isProduction() ? true : false,
    sameSite: isProduction() ? "None" : "Strict"
});