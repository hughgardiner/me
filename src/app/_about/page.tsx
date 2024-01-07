import Image from "next/image";
import { PageHeader } from "../components/PageHeader";

const AboutMe = `Passionate Full Stack Developer (from both Web and Mobile Platforms, all the way into the Cloud) and overall team player with excellent communication skills. Experience operating within mid-size Agile Software development teams, serving as a subject matter expert in the data and cloud aspects of enterprise software applications. 
Demonstrated ability to not just develop enterprise software, but also serve in leadership roles that require the ability to communicate technical and domain expertise to individuals in management positions. 
Outside of the office, constantly exploring the excitement of new technologies. Shown great interest in mobile development through experimentation with both cross-platform development via React Native and Ionic, as well as native development using Swift. 
Active member within development community, attending meetups and contributing to open source projects.`;

export default function About() {
  return (
    <section className="from-liked rounded-lg bg-gradient-to-b to-black p-4">
      <PageHeader pageName={"About Me"} pageImagePath="/aboutMeBig.png" />
      <div className="flex max-h-full flex-col">
        <p className="self-start">{AboutMe}</p>
      </div>
    </section>
  );
}
