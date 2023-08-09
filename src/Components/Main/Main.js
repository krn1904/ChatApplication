import './Main.css';

function Main() {
  return( 
    <div className="background">
      <div className='messages'>
      Display the text messages
      </div>
      <div className='inputfield'>
        <input className='inputbox' type='text' placeholder='Please enter your text'/>
        <button className='sendButton'>Submit</button>
      </div>
    </div>
    );
}

export default Main;
