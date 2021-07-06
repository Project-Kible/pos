import {makeStyles} from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Modal from 'react-modal';
import {withRouter} from 'react-router-dom';

import {useSelector, useDispatch} from 'react-redux';
import {modalOpen} from '../reducers/modal';
import {resetOrder} from '../reducers/orderSheet';
import {addSales, quanIncrSales} from '../reducers/dailySales';

Modal.setAppElement('body');

const Payment = ({match, history}) => {
  const classes = useStyles();
  const {table} = match.params;
  const open = useSelector((state) => [...state.modal.open]);
  const order = useSelector((state) => state.orderSheet.order[table - 1]);
  const sales = useSelector((state) => state.dailySales.dailySales);
  const dispatch = useDispatch();

  const close = () => {
    dispatch(modalOpen({index: 3, open: false}));
  };
  const payCalc = () => {
    for (let i = 0; i < order.length; i++) {
      const index = sales.findIndex((sales) => sales.menu_name === order[i].menu_name);
      if (index === -1) {
        setTimeout(() => {
          dispatch(addSales({orderData: order[i]}));
        }, 500);
      } else {
        setTimeout(() => {
          dispatch(quanIncrSales({orderData: order[i], salesData: sales[index]}));
        }, 500);
      }
    }
    dispatch(resetOrder(table));
    dispatch(modalOpen({index: 3, open: false}));
    history.push('/');
  };

  return (
    <Modal className={classes.root} isOpen={open[3]}>
      <Container className={classes.contents} maxWidth={false}>
        <Typography className={classes.title}>
          IC 카드를 삽입하여 주십시오.
          <br />
          <br />
          마그네틱 카드인 경우
          <br />
          카드리더기에 긁어 주십시오.
          <br />
          <br />
          카드를 삽입하거나 긁은 후
          <br />
          결제 버튼을 눌러주십시오.
        </Typography>
      </Container>

      <Button className={classes.backB} onClick={close}>
        Back
      </Button>

      <Button className={classes.payB} onClick={payCalc}>
        결제
      </Button>
    </Modal>
  );
};

const useStyles = makeStyles({
  root: {
    position: 'relative',
    background: 'linear-gradient(to right, #48c6ef 0%, #6f86d6 100%)',
    width: 720,
    height: 900,
    left: 600,
    top: 90,
    borderRadius: 15,
    outline: 'none',
  },
  contents: {
    position: 'absolute',
    background: 'white',
    width: 640,
    height: 610,
    left: 40,
    top: 40,
    borderRadius: 15,
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    width: 640,
    left: 0,
    fontSize: 36,
    textAlign: 'center',
  },
  backB: {
    position: 'absolute',
    background: '#adff00',
    width: 640,
    height: 80,
    left: 40,
    bottom: 145,
    borderRadius: 15,
    fontSize: 30,
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {backgroundColor: '#adff00'},
  },
  payB: {
    position: 'absolute',
    background: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
    width: 640,
    height: 80,
    right: 40,
    bottom: 40,
    borderRadius: 15,
    color: 'white',
    fontSize: 38,
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: `linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)`,
    },
  },
});

export default withRouter(Payment);
