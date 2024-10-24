import crypto from "crypto";
import * as jose from "jose";

// App specific import (nuxt)
import type { EventHandlerRequest, H3Event } from "h3";
import { User, UserSession } from "~/server/db/schema";

const ENCRYPT_ALGORITHM = "aes-256-cbc";
const ENCRYPT_KEY = crypto.randomBytes(32);
const ENCRYPT_IV = crypto.randomBytes(16);

const REFRESH_TOKEN_BYTE_SIZE = 32;
const ACCESS_TOKEN_ALGORITHM = "HS256";
const ACCESS_TOKEN_SECRET_KEY = crypto.createSecretKey("supersecretkeyyoushouldnotcommittogithub", "utf-8");
const ACCESS_TOKEN_ISSUER = "http://localhost:3000";
const ACCESS_TOKEN_EXPIRATION_TIME = "10 m";

const HASH_KEY_LENGTH = 32;

export function encrypter() {
    const cipher = crypto.createCipheriv(ENCRYPT_ALGORITHM, ENCRYPT_KEY, ENCRYPT_IV);
    const decipher = crypto.createDecipheriv(ENCRYPT_ALGORITHM, ENCRYPT_KEY, ENCRYPT_IV);

    function encrypt(value: string) {
        return cipher.update(value, 'utf8', 'hex') + cipher.final("hex");
    }

    function decrypt(encrypted: string) {
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }

    return {
        encrypt,
        decrypt
    }
}

export function generateOpaqueToken() {
    const token = crypto.randomBytes(REFRESH_TOKEN_BYTE_SIZE).toString("hex");
    return token;
}

export async function generateAccessToken(email: string, { audience = "" } = {}) {
    return await new jose.SignJWT({ email }) // details to  encode in the token
        .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
        .setSubject(email)
        .setIssuedAt()
        .setIssuer(ACCESS_TOKEN_ISSUER) // issuer
        .setAudience(audience) // audience
        .setExpirationTime(ACCESS_TOKEN_EXPIRATION_TIME) // token expiration time, e.g., "1 day"
        .sign(ACCESS_TOKEN_SECRET_KEY); // secretKey generated from previous step
}

export async function verifyAccessToken(token: string, { audience = "" } = {}) {
    return await jose.jwtVerify(token, ACCESS_TOKEN_SECRET_KEY, {
        issuer: ACCESS_TOKEN_ISSUER,
        audience,
    });
}

export async function login(
    user: typeof User.$inferSelect, // User type can be inferred from ORM schema, this one from drizzle ORM
    options = {}
) {
    const refreshToken = generateOpaqueToken();

    const accessToken = generateAccessToken(user.email, options)

    // Insert refresh token to database (session table)
    await $db.insert(UserSession).values({
        refreshToken,
        userId: user.id
    })

    return {
        accessToken,
        refreshToken: encrypter().encrypt(refreshToken)
    }
}

export const hash = async (value: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // generate random 16 bytes long salt - recommended by NodeJS Docs
        const salt = crypto.randomBytes(16).toString("hex");

        crypto.scrypt(value, salt, HASH_KEY_LENGTH, (err, derivedKey) => {
            if (err) reject(err);
            // derivedKey is of type Buffer
            resolve(`${salt}.${derivedKey.toString("hex")}`);
        });
    });
};

export const hashCheck = async (value: string, hashed: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const [salt, hashKey] = hashed.split(".");
        // we need to pass buffer values to timingSafeEqual
        const hashKeyBuff = Buffer.from(hashKey, "hex");
        crypto.scrypt(value, salt, HASH_KEY_LENGTH, (err, derivedKey) => {
            if (err) reject(err);
            // compare the new supplied value with the hashed value using timeSafeEqual
            resolve(crypto.timingSafeEqual(hashKeyBuff, derivedKey));
        });
    });
};



// App specific utilities (nuxt)
export async function getAccessTokenPayload<E extends EventHandlerRequest>(event: H3Event<E>) {
    const bearerToken = getRequestHeader(event, "Authorization");

    if (bearerToken) {
        const bearerTokenParts = bearerToken.split(" ");

        if (bearerTokenParts.length === 2) {
            const accessToken = bearerTokenParts[1];

            try {
                const { payload } = await verifyAccessToken(accessToken)
                return payload;
            } catch (error) {
                if (error instanceof jose.errors.JWTExpired) {
                    throw new HttpError("Access token expired.", {
                        statusCode: 401,
                        code: responseCode.JWT_EXPIRED
                    })
                }
            }
        }
    }

    throw new HttpError("Invalid access token.", {
        statusCode: 401
    })
}
