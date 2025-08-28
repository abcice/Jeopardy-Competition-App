import Navbar from '../../../components/Navbar/Navbar'
import Footer from '../../../components/Footer/Footer'
import BackButton from '../../../components/BackButton/BackButton';
import NextButton from '../../../components/NextButton/NextButton'
import SaveButton from '../../../components/SaveButton/SaveButton'


export default function CreateGame () {

    return (
        <>
        <Navbar/>
        <div>
            <h1>Create a competition</h1>
            <label>Name the competition</label>
            <input type="text" name="name"></input>
            <label>Number of the categories</label>
            <input type="number" name="number of categories"></input>
            <label>Number of questions</label>
            <input type="number" name="number of questions"></input>
            <BackButton/>
            <SaveButton/>
        </div>
        <Footer/>
        </>
    );
}