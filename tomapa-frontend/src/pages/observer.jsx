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
    TimeScale,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Line } from 'react-chartjs-2';

  import 'chartjs-adapter-date-fns';
  import {de} from 'date-fns/locale';

  import {Trash2, Truck} from "react-feather";


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    TimeScale,
    LineElement,
    
    Title,
    Tooltip,
    Legend
  );

const ObserverPage = () => {

    const [observedParts, setObservedParts] = useState([]);
    
    const [modalObservationPart, setModalObservationPart] = useState()
    const [showObservationModal, setShowObservationModal] = useState(false);


    const [chartLabels, setChartLabels] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [priceData, setPriceData] = useState([]);

    const [newObsSource, setNewObsSource] = useState("lcsc");
    const [newObsPartCode, setNewObsPartCode] = useState("");

    const [scaleMin, setScaleMin] = useState(undefined);

    const [sourceUrl, setSourceUrl] = useState("");

    const chart_options = {
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
        adapters: {
            date: {
                locale: de
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'hour',
                    displayFormats: {
                      hour: 'dd.MM. HH:mm'
                    },
                    tooltipFormat: 'dd.MM. HH:mm'
                },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                },
            },
            y: {
                type: 'linear' ,
                min: scaleMin,
                display: true,
                position: 'left',
            },
            y1: {
                type: 'linear',
                min: scaleMin,
                display: true,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };
    
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
        <h1>Part Monitoring</h1>
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
                <Button
                    variant="link"
                    size="sm"
                    className="text-danger float-end"
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
                    <Trash2 />
                </Button>

                {sourceUrl ? (
                    <a
                    href={sourceUrl}
                    target="_blank"
                    className="pt-1 text-info float-end"
                    >
                    <Truck />
                    </a>
                ) : (
                    <></>
                )}
                <Line options={chart_options} data={chartData} />
                <Form.Group className="mb-3" id="formGridCheckbox">
                    <Form.Check type="checkbox" label="Use 0 as minimum" 
                    onChange={(e) => {
                        setScaleMin(e.target.checked ? 0 : undefined);
                    }}/>
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowObservationModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        
        </>) : (<></>)}

        <h4>Add Part to Monitoring:</h4>
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
          Monitor Part!
        </Button>
        
        <hr></hr>

        <h4>Active Monitorings:</h4>
        <ListGroup>
            {
                observedParts.map((op) => (<>
                <ListGroup.Item
                    action
                    onClick={() => {
                        setModalObservationPart(op);
                        setShowObservationModal(!showObservationModal);

                        setChartLabels(op.observations.map((op) => (op.created_at * 1000)).reverse());
                        setStockData(op.observations.map((op) => op.stock).reverse());
                        setPriceData(op.observations.map((op) => op.usd_price).reverse());

                        if (!!op.source && !!op.part_code) {
                            if (op.source.toLowerCase() == "lcsc")
                                setSourceUrl(`https://www.lcsc.com/product-detail/${op.part_code}.html`);
                            if (op.source.toLowerCase() == "mouser")
                                setSourceUrl(`https://www.mouser.de/ProductDetail/${op.part_code}`);
                        }
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