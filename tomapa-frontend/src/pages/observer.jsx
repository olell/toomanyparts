import axios from "axios";
import { getApiEndpoint } from "../util/api";

import { useEffect, useState } from "react";
import { ListGroup, Modal, Button, Form } from "react-bootstrap";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

export const chart_options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'History',
      },
    },
    scales: {
      y: {
        type: 'linear' ,
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        min: 0,
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

const ObserverPage = () => {

    const [observedParts, setObservedParts] = useState([]);
    
    const [modalObservationPart, setModalObservationPart] = useState()
    const [showObservationModal, setShowObservationModal] = useState(false);


    const [chartLabels, setChartLabels] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [priceData, setPriceData] = useState([]);

    const [newObsSource, setNewObsSource] = useState("");
    const [newObsPartCode, setNewObsPartCode] = useState("");


    const chartData = {
        labels: chartLabels,
        datasets: [
        {
            label: 'Stock',
            data: stockData,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            yAxisID: 'y',
        },
        {
            label: 'Price ($)',
            data: priceData,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            yAxisID: 'y1',
        },
        ],
    };

    const loadObservations = () => {
        axios
        .get(getApiEndpoint("/observer/part"), {})
        .then((response) => {
            if (response.status === 200) {
                setObservedParts(response.data["observed_parts"]);
                console.log(response.data)
            }
        })
    }

    useEffect(() => {
        loadObservations();
    }, [])


    useEffect(() => {
        console.log(chartData)
    }, [chartLabels])

    return (
        <>
        <h1>Part Observations</h1>
        <hr />

        {!!modalObservationPart ? (<>
            <Modal
            size="xl"
            show={showObservationModal}
            onHide={() => setShowObservationModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <h3>
                    Price/Stock History for <b>{modalObservationPart.name}</b> ({modalObservationPart.source.toUpperCase()} - {modalObservationPart.part_code})
                </h3>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Line options={chart_options} data={chartData} />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger"
                onClick={() => {
                    let data = {
                        id: modalObservationPart.id,
                    };
                    axios.delete(getApiEndpoint("/observer/part"), { data: data }).then((response) => {
                        if (response.status === 204) {
                            loadObservations();
                            setShowObservationModal(false);
                        }
                    });
                }}
              >
                Delete Observation
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowObservationModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        
        </>) : (<></>)}

        <h4>Add Observation:</h4>
        <Form.Group>
            <Form.Label>Source</Form.Label>
            <Form.Select
                value={newObsSource}
                onChange={(e) => {
                    setNewObsSource(e.target.value);
                }}
                >
                <option value="lcsc">LCSC</option>
                <option value="mouser">Mouser (currently not supported)</option>
            </Form.Select>
        </Form.Group>
        <Form.Group>
            <Form.Label>Part Code</Form.Label>
            <Form.Control
                type="text"
                value={newObsPartCode}
                onChange={(e) => setNewObsPartCode(e.target.value)}
            ></Form.Control>
        </Form.Group>
        <Button
          variant="success"
          className="mt-1"
          onClick={() => {
            var data = new FormData();
            data.append("source", newObsSource);
            data.append("part_code", newObsPartCode);
            axios
                .post(getApiEndpoint("/observer/part"), data, {
                    headers: { "Content-Type": "application/json" },
                })
                .then((response) => {
                    loadObservations();
                });
          }}
        >
          Observe Part
        </Button>
        
        <hr></hr>

        <h4>Active Observations:</h4>
        <ListGroup>
            {
                observedParts.map((op) => (<>
                <ListGroup.Item
                    action
                    onClick={() => {
                        setModalObservationPart(op);
                        setShowObservationModal(!showObservationModal);

                        setChartLabels(op.observations.map((op) => (new Date(op.created_at * 1000).toLocaleString("de-DE"))).reverse());
                        setStockData(op.observations.map((op) => op.stock).reverse());
                        setPriceData(op.observations.map((op) => op.usd_price).reverse());
                    }}>
                    <b>{op.name}</b> ({op.source.toUpperCase()} - {op.part_code})
                </ListGroup.Item>
                </>))
            }
        </ListGroup>
        </>
    )

}

export default ObserverPage;