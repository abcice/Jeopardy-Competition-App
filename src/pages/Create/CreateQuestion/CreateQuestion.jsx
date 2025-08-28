import Navbar from '../../../components/Navbar/Navbar'
import Footer from '../../../components/Footer/Footer'
import BackButton from '../../../components/BackButton/BackButton';
import NextButton from '../../../components/NextButton/NextButton'
import SaveButton from '../../../components/SaveButton/SaveButton'


export default function CreateQuestion () {

    return (
        <>
        <Navbar/>
        <div>
            <h1>Create Questions</h1>
            <button>Import old questions</button>
            <form>
            <label>category</label>
            <select>
                <option></option>
            </select>

            </form>
            <label> Question</label>
            <textarea></textarea>
            <label>Answer</label>
            <textarea></textarea>
            <label>Score</label>
            <input type="Score" name="score of the question"></input>
            <label>Daily double</label>
            <input type="checkbox"></input>
            <BackButton/>
            <SaveButton/>
        </div>
        <Footer/>
        </>
    );
}