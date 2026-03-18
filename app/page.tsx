import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <section className="container mx-auto px-10 py-32">
          <div className="mx-auto">
            <h1 className="text-foreground mb-6 text-5xl font-bold">
              A better way to track your workout.
            </h1>
            <p className="text-muted-foreground mb-10 text-xl">
              Capture, organize and manage your workouts in one place.
            </p>
            <div>
              <button>Start</button>
              <p>Build your workout plan for free.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
