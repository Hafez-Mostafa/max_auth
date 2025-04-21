import { verifyAuth } from "@/lib/authentication";
import { getTrainings } from "@/lib/training";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function TrainingPage() {
  const result = await verifyAuth();
  console.log("Auth verification result:", result); // Debugging linei
  if (!result.user) {
    return redirect("/");
  }

  const trainingSessions = getTrainings();

  return (
    <main>
      <h1>Find your favorite activity</h1>
      <ul id="training-sessions">
        {trainingSessions.map((training) => (
          <li key={training.id}>
            <Image
              src={`/trainings/${training.image.replace(/^\/+/, "")}`}
              alt={training.title}
              width={202.66}
              height={202.66}
            />

            {/* <img   src={`/trainings/${training.image}`}   alt={training.title} /> */}
            <div>
              <h2>{training.title}</h2>
              <p>{training.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
