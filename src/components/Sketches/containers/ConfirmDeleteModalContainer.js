import { connect } from 'react-redux';
import { deleteProgram } from '../../../actions/programsActions';
import { setMostRecentProgram } from '../../../actions/userDataActions';
import * as fetch from '../../../lib/fetch';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const mapStateToProps = (state) => {
  const { mostRecentProgram, uid } = state.userData;
  const programKeys = state.programs.keySeq(); // this is an immutable sequence
  return {
    mostRecentProgram,
    programKeys,
    uid,
  };
};

const mapDispatchToProps = (dispatch) => ({
  deleteProgram: (program, data) => dispatch(deleteProgram(program, data)),
  setMostRecentProgram: (value, uid) => {
    try {
      fetch.updateUserData(uid, { mostRecentProgram: value }).catch((err) => {
        console.error(err);
      });
    } catch (err) {
      console.error(err);
    }
    dispatch(setMostRecentProgram(value));
  },
});

const ConfirmDeleteModalContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfirmDeleteModal);

export default ConfirmDeleteModalContainer;
