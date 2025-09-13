import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import PlayerRankingContent from "./PlayerRankingContent";

export default function PlayerRankingPage({ playerToken }) {
  if (!playerToken) {
    return <p>❌ Player token missing. Please join the competition first.</p>;
  }

  return (
    <>
      <Navbar />
      <main>
        <PlayerRankingContent playerToken={playerToken} />
      </main>
      <Footer />
    </>
  );
}
