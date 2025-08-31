import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import RankingContent from "./RankingContent";

export default function RankingPage({ competitionId }) {
  return (
    <>
      <Navbar />
      <main>
        <RankingContent competitionId={competitionId} />
      </main>
      <Footer />
    </>
  );
}
