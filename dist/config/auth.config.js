const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido no arquivo .env');
}
export { jwtSecret };
