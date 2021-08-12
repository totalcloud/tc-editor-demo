import JSONEditor, { JSONEditorOptions } from "jsoneditor";
import ace, { Annotation, Editor, IEditSession } from "brace";
import "brace/mode/json";
import "brace/ext/language_tools";
import "brace/ext/searchbox";

import * as React from "react";
import { Button, Col, InputGroup, Label, Row } from "reactstrap";

import "jsoneditor/dist/jsoneditor.css";

if (ace) {
  const langTools = ace.acequire("ace/ext/language_tools");
}

const JsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  description: "Parameters.",
  additionalProperties: false,
  type: "object",
  argumentOrder: ["resourceUri", "options", "callback"],
  properties: {
    options: {
      description: "Optional Parameters.",
      additionalProperties: false,
      type: "object",
      properties: {
        metricnames: {
          type: "string",
          description: "The names of the metrics (comma separated) to retrieve."
        },
        orderby: {
          type: "string",
          description:
            "The aggregation to use for sorting results and the direction of the sort. Only one order can be specified. Examples: sum asc."
        },
        aggregation: {
          type: "string",
          description:
            "The list of aggregation types (comma separated) to retrieve."
        },
        timespan: {
          type: "string",
          description:
            "The timespan of the query. It is a string with the following format 'startDateTime_ISO/endDateTime_ISO'."
        },
        onDownloadProgress: {
          type: "object",
          description: "Callback which fires upon download progress.",
          additionalProperties: false
        },
        timeout: {
          type: "number",
          description:
            "The number of milliseconds a request can take before automatically being terminated."
        },
        filter: {
          type: "string",
          description:
            "The **$filter** is used to reduce the set of metric data returned.<br>Example:<br>Metric contains metadata A, B and C.<br>- Return all time series of C where A = a1 and B = b1 or b2<br>**$filter=A eq ‘a1’ and B eq ‘b1’ or B eq ‘b2’ and C eq ‘*’**<br>- Invalid variant:<br>**$filter=A eq ‘a1’ and B eq ‘b1’ and C eq ‘*’ or B = ‘b2’**<br>This is invalid because the logical or operator cannot separate two different metadata names.<br>- Return all time series where A = a1, B = b1 and C = c1:<br>**$filter=A eq ‘a1’ and B eq ‘b1’ and C eq ‘c1’**<br>- Return all time series where A = a1<br>**$filter=A eq ‘a1’ and B eq ‘*’ and C eq ‘*’**."
        },
        top: {
          type: "number",
          description:
            "The maximum number of records to retrieve. Valid only if $filter is specified. Defaults to 10."
        },
        metricnamespace: {
          type: "string",
          description: "Metric namespace to query metric definitions for."
        },
        interval: {
          type: "string",
          description: "The interval (i.e. timegrain) of the query."
        },
        onUploadProgress: {
          type: "object",
          description: "Callback which fires upon upload progress.",
          additionalProperties: false
        },
        abortSignal: {
          description: "The signal which can be used to abort requests.",
          additionalProperties: false,
          type: "object",
          properties: {
            dispatchEvent: {
              type: "object",
              additionalProperties: false
            },
            removeEventListener: {
              type: "object",
              additionalProperties: false
            },
            onabort: {
              type: "object",
              additionalProperties: false
            },
            aborted: {
              type: "boolean"
            },
            addEventListener: {
              type: "object",
              additionalProperties: false
            }
          },
          required: [
            "aborted",
            "addEventListener",
            "dispatchEvent",
            "onabort",
            "removeEventListener"
          ]
        },
        resultType: {
          type: "string",
          description:
            "Reduces the set of data collected. The syntax allowed depends on the operation. See the operation's description for details. Possible values include: 'Data', 'Metadata'",
          enum: ["Data", "Metadata"]
        },
        customHeaders: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        }
      }
    },
    resourceUri: {
      type: "string"
    }
  },
  required: ["resourceUri", "options"]
};

export type SchemaValidationError = {
  path: (string | number)[];
  message: string;
};

interface IProps {
  id?: string;
  label?: string;
  error?: any;
  name?: string;
  showCopyControl?: boolean;
  autoCompletionList?: string[];
  value: any;
  onSchemaValidation?: (
    json: any
  ) => SchemaValidationError[] | Promise<SchemaValidationError[]>;
  style?: any;
  onChange: (props: { data: any; error: boolean }) => void;
}

export class TcJsonEditor extends React.Component<IProps> {
  jsoneditor: JSONEditor | null = null;
  container: HTMLDivElement | null = null;

  handleChange = (data: any) => {
    this.props &&
      this.props.onChange &&
      this.props.onChange({ data, error: false });
  };

  handleError = (errors: any[]) => {
    if (errors && errors.length) {
      errors = errors.filter(x => x.type !== "customValidation");
    }
    if (!errors || errors.length === 0)
      this.props.onChange({ data: this.props.value.data, error: false });
    else {
      this.props.onChange({ data: this.props.value.data, error: true });
    }
  };

  handleCodeChange = (data: string) => {
    if (this.jsoneditor && this.jsoneditor.getMode() === "code") {
      try {
        let json = JSON.parse(data);
        this.handleChange(json);
      } catch (error) {}
    }
  };

  getOptions = (): JSONEditorOptions => {
    return {
      mode: "tree",
      modes: ["code", "tree"],
      // @ts-ignore
      ace: ace,
      schema: JsonSchema,
      onChangeText: this.handleCodeChange,
      onChangeJSON: this.handleChange,
      //   autocomplete: this.getAutoComplete(),
      //   onValidationError: this.handleError,
      onValidate: this.props.onSchemaValidation
    };
  };
  getAutoComplete = () => {
    let { autoCompletionList } = this.props;
    return {
      caseSensitive: false,
      filter: (token: string, item: string) => {
        token = token.replace(/\.\d*\./g, "").replace('"', "");
        let prefix = token.substring(0, token.lastIndexOf("."));
        let result =
          item.startsWith(prefix) &&
          item
            .toLowerCase()
            .includes(
              token.toLowerCase().substring(token.lastIndexOf(".") + 1)
            );
        return result;
      },
      getOptions: function() {
        return autoCompletionList || [];
      }
    };
  };

  componentDidMount() {
    this.jsoneditor = new JSONEditor(
      this.container as HTMLElement,
      this.getOptions()
    );
    this.jsoneditor.set(this.props.value.data);
  }

  componentWillUnmount() {
    if (this.jsoneditor) {
      this.jsoneditor.destroy();
    }
  }

  componentDidUpdate(
    prevProps: Readonly<IProps>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    //   let { ace} = JSONEditor;
    // if (ace && !ace.completers) {
    //   ace.commands.on("afterExec", (e: any) => {
    //     // console.log("afterExec");
    //     if (e.command.name == "insertstring" && /^[\w.]$/.test(e.args)) {
    //       ace.execCommand("startAutocomplete");
    //     }
    //   });
    //   let staticWordCompleter = getWordCompleter(this.props.autoCompletionList);
    //   aceEditor.completers = [staticWordCompleter];
  }

  render() {
    const {
      label,
      id,
      name,
      value,
      error,
      showCopyControl = true
    } = this.props;
    const invalid = !!(error && error.length);
    return (
      <Row>
        <Col sm={12}>
          <InputGroup className={"row"}>
            <Col md={8}>{label && <Label for={id}>{label}</Label>}</Col>
            {showCopyControl && (
              <Col md={4} className={"text-right"}>
                <Button
                  className='test-copy-button'
                  size={"sm"}
                  color={"link"}
                  onClick={
                    () => null
                    // copyToClipboard(JSON.stringify(value.data, null, 3))
                  }>
                  Copy to clipboard
                </Button>
              </Col>
            )}

            <Col md={12}>
              <div
                className='jsoneditor-react-container'
                ref={elem => (this.container = elem)}
              />
            </Col>

            {invalid && (
              <Col>
                <small style={{ color: "#fb6340" }}>{error}</small>
              </Col>
            )}
          </InputGroup>
        </Col>
      </Row>
    );
  }
}
