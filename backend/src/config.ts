if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in .env");
}

export const config: {
    port: number;
    openaiKey: string;
    databaseUrl: string;
} = {
    port: parseInt(process.env.PORT || "4000"),
    openaiKey: process.env.OPENAI_API_KEY,
    databaseUrl: process.env.DATABASE_URL!,
};
