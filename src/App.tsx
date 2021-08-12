import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Col, Container, Row, Button } from "reactstrap";
import { TcJsonEditor } from "./JSONEditor";

function App() {
  const [value, setvalue] = useState({
    data: {
      options: {
        filter: "<optional>",
        metricnames: "<optional>",
        top: "<optional>",
        metricnamespace: "<optional>",
        orderby: "<optional>",
        interval: "<optional>",
        aggregation: "<optional>",
        timespan: "<optional>",
        abortSignal: {
          aborted: "required"
        },
        resultType: "<optional>",
        timeout: "<optional>"
      },
      resourceUri: "required"
    },
    error: false
  });

  const onChange = ({ data, error }: { data: any; error: boolean }) => {
    console.log(data, error);
  };

  return (
    <div className='App'>
      <Container>
        <Row>
          <Col md={6} className='mx-auto mt-5'>
            <h3>TC JSONEDITOR help popup for params.</h3>
            <p>
              Hover over any property-name to view the description as per
              json-schema
            </p>
            <TcJsonEditor
              showCopyControl={false}
              onChange={onChange}
              autoCompletionList={[]}
              name='test-editor'
              id='test-items'
              value={value}
            />
          </Col>
        </Row>

        <div className='fixed-bottom bottom-0 left-0 text-center w-100 py-4'>
          <a href='https://totalcloud.io' target='_blank' rel='noreferrer'>
            Totalcloud.io
          </a>
        </div>
      </Container>
    </div>
  );
}

export default App;
