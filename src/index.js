import hh from "hyperscript-helpers";
import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";


// allows using html tags as functions in javascript
const { div, button, p, h1, table, tbody, th, td, tr, input, label } = hh(h);

// A combination of Tailwind classes which represent a (more or less nice) button style
const btnStyle = "bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition-colors ring-offset-1 focus:ring-green-700";
const btnStyle2 = "bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 transition-colors ring-offset-1 focus:ring-red-700";

// Messages which can be used to update the model
const MSGS = {
    LOCATIONS: "LOCATIONS",
    ADD: "ADD",
    DELETE: "DELETE",
  };

function view(dispatch, model) {

  return div({ className: "flex flex-col gap-4 items-center" }, [
    label({ className: "text-gray-700 text-sm font-bold mb-2" }, "Location"),
    input({ id: "location",
      className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700",
    }),
    button({
      className: btnStyle,
      onclick: () => dispatch({ type: MSGS.ADD, payload: {location: document.getElementById("location").value} })
    }, "ADD"),
    div({ className: "flex flex-row gap-4 items-center" }, [
      table({ className: "flex flex-col gap-5 p-7 shadow " }, [
        tr({ className: "flex flex-row gap-7" }, [
          th({}, "Location"),
          th({}, "Temp"),
          th({}, "Low"),
          th({}, "High"),
          th({}, "action"),
        ]),
        tbody({}, model.tItems.map((item) => 
        tr({ className: "flex flex-row gap-9" },  [            
            td({}, item.location),
            td({}, item.temp.toString()),
            td({}, item.high.toString()),
            td({}, item.low.toString()),
            td([
              button({
                className: btnStyle2,
                onclick: () =>
                  dispatch({ type: MSGS.DELETE, payload: item.id }),
              },
                "Delete"),
            ])
        ])
        )
        )])
    ])
])
            
}

// Update function which takes a message and a model and returns a new/updated model
function update(msg, model) {
    console.log("msg: ",msg);
    console.log("model: ",model);
    switch (msg.type) {
      case MSGS.LOCATIONS:
        return {...model, tempValue: {...model.tempValue, temp: msg.value } };
      case MSGS.ADD:
        const messagePayload = msg.payload.location;
        console.log(messagePayload);
        let [landName] = messagePayload.split(" ");
        let newWeatherObject = weatherAppData(landName);
        const updateItems = model.tItems.concat(newWeatherObject);
        return {...model, tItems: updateItems };
  
      case MSGS.DELETE:
        const iddel = msg.payload;
        const filteredItems = model.tItems.filter((item) => item.id !==iddel);
        return {...model, tItems: filteredItems };
      default:
        return model;
    }
  }

// ⚠️ Impure code below (not avoidable but controllable)
function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);
  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const exampleData = weatherAppData("mukacheve")

const initModel = {
  tItems: [exampleData],
};

console.log(initModel)

// The root node of the app (the div with id="app" in index.html)
const rootNode = document.getElementById("app");

// Start the app
app(initModel, update, view, rootNode);


function weatherAppData(landName){
  let configData;
  let weatherappdata;
  let id = Date.now();
  let request = new XMLHttpRequest();
      request.open("GET", "http://192.168.1.106:9000/config.json", false);
      request.send(null);
      if (request.status === 200) {
        configData = JSON.parse(request.responseText);
      }
  let apiRequest = new XMLHttpRequest();
      apiRequest.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${landName}&lang=de&appid=${configData.apiWeatherKey}&units=metric`, false);
      apiRequest.send(null);
      if(apiRequest.status === 200){
        weatherappdata = JSON.parse(apiRequest.responseText)
      }

      console.log(weatherappdata)

  let returnObj = {id: id, location: weatherappdata.name, temp: weatherappdata.main.temp, high: weatherappdata.main.temp_max, low: weatherappdata.main.temp_min }
  return returnObj;
}
