import { PageHeader } from "../components/PageHeader";

const skills = [
  {
    name: "TypeScript",
    timeFrame: "2 years",
  },
  {
    name: "React",
    timeFrame: "4 years",
  },
];

export default function Skills() {
  return (
    <section className="rounded-lg bg-gradient-to-b from-zinc-700 to-dark p-4">
      <PageHeader
        stat={{ name: "skills", value: skills.length }}
        pageName={"Skills"}
        pageImagePath="/skills.png"
      />
      <div className="flex max-h-full flex-col">
        <h3 className="self-start">I have lots, but presentation coming soon :)</h3>
      </div>
    </section>
  );
}
