import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
export default function Dashboard () {

    return (
        <>
        <Navbar/>
        <div>
            <button>Start game</button>
            <button>Create jeopardy</button>
            <button>Edit jeopardy</button>
        </div>
        <Footer/>
        </>
    );
}