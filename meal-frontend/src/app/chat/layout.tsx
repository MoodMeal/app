
export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className="h-screen w-full bg-primary text-primary">
            {children}
        </section>
    );
}
