import React from 'react';
import axios from 'axios';
import moment from "moment"
import { 
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect,
  useHistory,
  useParams
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import './App.css';


const request = axios.create({
  baseURL: 'http://localhost:8080/',
  paramsSerializer: paramsObj => JSON.stringify(paramsObj),
});

const Console = () => {
  const [value, setValue] = React.useState("");
  const [result, setResult] = React.useState([]);

  return (
    <form 
      className="console"
      onSubmit={(e) => {
        e.preventDefault();
        request
          .post("/console", { query: value})
          .then((value) =>{            
            if (value.status === 200) {
              setResult([...result, value.data.length ? JSON.stringify(value.data) : "Empty set" ])
            } else {
              setResult([...result, value.data.sqlMessage])
            }
          });
      }}
    >
      {result.map((value) => <p>{value}</p>)}
      <input 
        type="textarea" 
        value={value} 
        onChange={event => setValue(event.target.value)}
      />
    </form>
  )
}

const Home = () => {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/product_groupe">Группа товаров</Link></li>
          <li><Link to="/factorier">Производитель</Link></li>
          <li><Link to="/product">Товар</Link></li>
          <li><Link to="/provider">Поставщик</Link></li>
          <li><Link to="/supply">Поставка</Link></li>
          <li><Link to="/employee">Сотрудник</Link></li>
          <li><Link to="/sale">Продажа</Link></li>
        </ul>
      </nav>
    </div>
  )
};

const CreatePage = ({ url, children }) => {
  const history = useHistory();
  const [values, setValues] = React.useState({});

  const handleChange = (name, value) => setValues({
    ...values,
    [name]: value
  });

  return (
    <>
      <div className="heading content">
        <div />
        <Link className="button" to={url}>Назад</Link>
      </div>
      <form className="content" onSubmit={(e) => {
        e.preventDefault();
        request
          .post(url, values)
          .then(() => history.replace(url));
      }}>
        <div>
          {React.Children.map(children, child => {
            return React.cloneElement(child, {
              placeholder: child.props.placeholder || child.props.name,
              value: values[child.props.name],
              onChange: (event) => handleChange(child.props.name, event.target.value)
            }) 
          })}
        </div>     
        <input type="submit" className="button" value="Создать" />
      </form>
    </>
  )
}

const EditPage = ({ url, children}) => {
  const history = useHistory();
  const { id } = useParams();

  const [values, setValues] = React.useState({});

  React.useEffect(() => {
    if (id && url ) {
      request.get(`${url}/${id}`).then(({data}) => setValues(data))
    }
  }, [id, url])

  const handleChange = (name, value) => setValues({
    ...values,
    [name]: value
  });

  return (
    <>
      <div className="heading content">
        <div />
        <Link className="button" to={url}>Назад</Link>
      </div>
        <form 
          className="content"
          onSubmit={(e) => {
            e.preventDefault();
            request
              .put(`${url}/${id}`, values)
              .then(() => history.replace(url));
              }}
        >
        <div >
          {React.Children.map(children, child => {
            return React.cloneElement(child, {
              placeholder: child.props.placeholder || child.props.name,
              value: values[child.props.name],
              onChange: (event) => handleChange(child.props.name, event.target.value)
            }) 
          })}
        </div>        
        <input type="submit" className="button" value="Обновить" />
      </form> 
    </>
  )
}

/* Группа товаров */

const ProductGroupe = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/product_groupe";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Группа Товаров</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код группы товаров</th>
            <th>Название</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["название"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ProductGroupeCreate = () => (
  <CreatePage url="/product_groupe"> 
    <input 
      type="text" 
      name="название"
      required
    />
  </CreatePage>
)

const ProductGroupeEdit = () => (
  <EditPage  url="/product_groupe">
    <input 
      type="text" 
      name="название"
      required
    />
  </EditPage>
)

/* Производитель */

const Factorier = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/factorier";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Производитель</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код производителя</th>
            <th>Название</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["название"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const FactorierCreate = () => (
  <CreatePage url="/factorier"> 
    <input 
      type="text" 
      name="название"
      required
    />
  </CreatePage>
)

const FactorierEdit = () => (
  <EditPage  url="/factorier">
    <input 
      type="text" 
      name="название"
      required
    />
  </EditPage>
)

/* Товар */

const Product = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/product";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Товар</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код товара</th>
            <th>Название</th>
            <th>Группа товара</th>
            <th>Производитель</th>
            <th>Цена</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["название"]}</td>
              <td>{item["группа_товаров"]}</td>
              <td>{item["производитель"]}</td>
              <td>{item["цена"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ProductCreate = () => {
  const [productGroupes, setProductGroupes] = React.useState([]);
  const [factoriers, setFactoriers] = React.useState([]);

  React.useEffect(() => {
    request.get("/product_groupe").then(values => {
        setProductGroupes(values.data)
      })

    request.get("/factorier").then(values => {
      setFactoriers(values.data)
    })
  }, [])

  return (
    <CreatePage url="/product"> 
      <input
        type="text" 
        name="название"
        required
      />
      <select name="код_группы_товаров" required>
        <option value="" disabled selected>Группа товара</option>
        {productGroupes.map(productGroupe => (
          <option key={productGroupe.id} value={productGroupe.id}>
            {productGroupe["название"]}
          </option>
        ))}
      </select>
      <select name="код_производителя" required>
        <option value="" disabled selected>Производитель</option>
        {factoriers.map(factorier => ( 
          <option key={factorier.id} value={factorier.id}>
            {factorier["название"]}
          </option>
        ))}
      </select>
      <input 
        type="number" 
        name="цена"
        required
      />
    </CreatePage>
)}

const ProductEdit = () => {
  const [productGroupes, setProductGroupes] = React.useState([]);
  const [factoriers, setFactoriers] = React.useState([]);

  React.useEffect(() => {
    request.get("/product_groupe").then(values => {
      setProductGroupes(values.data)
    })

    request.get("/factorier").then(values => {
      setFactoriers(values.data)
    })
  }, [])

  return (
    <EditPage url="/product">
      <input 
          type="text" 
          name="название"
          required
        />
        <select name="код_группы_товаров" required>
          <option value="" disabled>группа товара</option>
          {productGroupes.map(productGroupe => ( 
            <option key={productGroupe.id} value={productGroupe.id}>
              {productGroupe["название"]}
            </option>
          ))}
        </select>
        <select name="код_производителя" required>
          <option value="" disabled>Производитель</option>
          {factoriers.map(factorier => ( 
            <option key={factorier.id} value={factorier.id}>
              {factorier["название"]}
            </option>
          ))}
        </select>
        <input 
          type="number" 
          name="цена"
          required
        />
    </EditPage>
)}
 
/* поставщик */

const Provider = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/provider";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Поставщик</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код поставщика</th>
            <th>Название</th>
            <th>Контактный телефон</th>
            <th>Адрес</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["название"]}</td>
              <td>{item["контактный_телефон"]}</td>
              <td>{item["адрес"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ProviderCreate = () => {
  return (
    <CreatePage url="/provider"> 
      <input
        type="text" 
        name="название"
        required
      />
      <input
        type="text" 
        name="контактный_телефон"
        required
      />
      <input
        type="text" 
        name="адрес"
        required
      />
    </CreatePage>
)}

const ProviderEdit = () => {
  return (
    <EditPage url="/provider">
      <input
        type="text" 
        name="название"
        required
      />
      <input
        type="text" 
        name="контактный_телефон"
        required
      />
      <input
        type="text" 
        name="адрес"
        required
      />
    </EditPage>
)}

/* поставка */

const Supply = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/supply";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Поставка</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код поставки</th>
            <th>Дата поставки</th>
            <th>Товар</th>
            <th>Поставщик</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{moment(item["дата_поставки"]).format("DD/MM/YYYY")}</td>
              <td>{item["товар"]}</td>
              <td>{item["поставщик"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SupplyCreate = () => {
  const [products, setProducts] = React.useState([]);
  const [providers, setProviders] = React.useState([]);

  React.useEffect(() => {
    request.get("/product").then(values => {
      setProducts(values.data)
    })

    request.get("/provider").then(values => {
      setProviders(values.data)
    })
  }, [])

  return (
    <CreatePage url="/supply"> 
      <input 
        type="date"
        max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
        name="дата_поставки"
        required
      />
      <select name="код_товара" required>
        <option value="" disabled selected>Товар</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product["название"]}
          </option>
        ))}
      </select>
      <select name="код_поставщика" required>
        <option value="" disabled selected>Поставщик</option>
        {providers.map(provider => ( 
          <option key={provider.id} value={provider.id}>
            {provider["название"]}
          </option>
        ))}
      </select>
    </CreatePage>
)}

const SupplyEdit = () => {
  const [products, setProducts] = React.useState([]);
  const [providers, setProviders] = React.useState([]);

  React.useEffect(() => {
    request.get("/product").then(values => {
      setProducts(values.data)
      })

    request.get("/provider").then(values => {
      setProviders(values.data)
    })
  }, [])

  return (
    <EditPage url="/supply"> 
      <input 
        type="date" 
        name="дата_поставки"
        max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
        required
      />
      <select name="код_товара" required>
        <option value="" disabled>Товар</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product["название"]}
          </option>
        ))}
      </select>
      <select name="код_поставщика" required>
        <option value="" disabled>Производитель</option>
        {providers.map(provider => ( 
          <option key={provider.id} value={provider.id}>
            {provider["название"]}
          </option>
        ))}
      </select>
    </EditPage>
)}

/* сотрудник */

const Employee = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/employee";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Cотрудник</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код сотрудника</th>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Должность</th>
            <th>Телефон</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["фамилия"]}</td>
              <td>{item["имя"]}</td>
              <td>{item["должность"]}</td>
              <td>{item["телефон"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const EmployeeCreate = () => {
  return (
    <CreatePage url="/employee"> 
      <input
        type="text" 
        name="фамилия"
        required
      />
      <input
        type="text" 
        name="имя"
        required
      />
      <input
        type="text" 
        name="должность"
        required
      />
      <input
        type="text" 
        name="телефон"
        required
      />
    </CreatePage>
)}

const EmployeeEdit = () => {
  return (
    <EditPage url="/employee">
      <input
        type="text" 
        name="фамилия"
        required
      />
      <input
        type="text" 
        name="имя"
        required
      />
      <input
        type="text" 
        name="должность"
        required
      />
      <input
        type="text" 
        name="телефон"
        required
      />
    </EditPage>
)}

/* продажа */

const Sale = () => {
  const history = useHistory()
  const [items, setItems] = React.useState([]);
  const [fetch, setFetch] = React.useState(false);

  const URL = "/sale";

  React.useEffect(() => {
    request.get(URL).then(values => {
      setItems(values.data)
    })
  },[fetch])

  return (
    <div className="list">
      <div className="heading content">
        <p>Продажа</p>
        <Link className="create button" to={`${URL}/create`}>Создать</Link>
      </div>
      <table className="content"> 
        <thead>
          <tr>
            <th>Код продажи</th>
            <th>Количество</th>
            <th>Товар</th>
            <th>Сотрудник</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item["количество"]}</td>
              <td>{item["товар"]}</td>
              <td>{item["фамилия"] + " " + item["имя"]}</td>
              <td>
                <button
                  className="icon-button"
                  onClick={() => history.push(`${URL}/${item.id }`)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => request.delete(`${URL}/${item.id }`)
                    .then(() => setFetch(!fetch))}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const SaleCreate = () => {
  const [products, setProducts] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);

  React.useEffect(() => {
    request.get("/product").then(values => {
      setProducts(values.data)
    })

    request.get("/employee").then(values => {
      setEmployees(values.data)
    })
  }, [])

  return (
    <CreatePage url="/sale"> 
      <input 
        type="number"
        name="количество"
        required
      />
      <select name="код_товара" required>
        <option value="" disabled selected>Товар</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product["название"]}
          </option>
        ))}
      </select>
      <select name="код_сотрудника" required>
        <option value="" disabled selected>Сотрудник</option>
        {employees.map(employee => ( 
          <option key={employee.id} value={employee.id}>
            {employee["фамилия"] + " " + employee["имя"]}
          </option>
        ))}
      </select>
    </CreatePage>
)}

const SaleEdit = () => {
  const [products, setProducts] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);

  React.useEffect(() => {
    request.get("/product").then(values => {
      setProducts(values.data)
    })

    request.get("/employee").then(values => {
      setEmployees(values.data)
    })
  }, [])

  return (
    <EditPage url="/sale"> 
      <input 
        type="number"
        name="количество"
        required
      />
      <select name="код_товара" required>
        <option value="" disabled>Товар</option>
        {products.map(product => (
          <option key={product.id} value={product.id}>
            {product["название"]}
          </option>
        ))}
      </select>
      <select name="код_сотрудника" required>
        <option value="" disabled>Сотрудник</option>
        {employees.map(employee => ( 
          <option key={employee.id} value={employee.id}>
          {employee["фамилия"] + " " + employee["имя"]}
          </option>
        ))}
      </select>
    </EditPage>
)}

const App = () => {
  return (
  <Router>
    <div className="App wrapper">
      <header>
        <div className="container">
          <p>Подготовила: Анастасия Савва</p>
          <Link to="/">Домой</Link>
        </div>
        {/* <Console /> */}
      </header>
      <main>
        <div className="container">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/product_groupe" component={ProductGroupe} />
            <Route exact path="/product_groupe/create" component={ProductGroupeCreate} />
            <Route exact path="/product_groupe/:id" component={ProductGroupeEdit} />
            <Route exact path="/factorier" component={Factorier} />
            <Route exact path="/factorier/create" component={FactorierCreate} />
            <Route exact path="/factorier/:id" component={FactorierEdit} />
            <Route exact path="/product" component={Product} />
            <Route exact path="/product/create" component={ProductCreate} />
            <Route exact path="/product/:id" component={ProductEdit} />
            <Route exact path="/provider" component={Provider} />
            <Route exact path="/provider/create" component={ProviderCreate} />
            <Route exact path="/provider/:id" component={ProviderEdit} />
            <Route exact path="/supply" component={Supply} />
            <Route exact path="/supply/create" component={SupplyCreate} />
            <Route exact path="/supply/:id" component={SupplyEdit} />
            <Route exact path="/employee" component={Employee} />
            <Route exact path="/employee/create" component={EmployeeCreate} />
            <Route exact path="/employee/:id" component={EmployeeEdit} />
            <Route exact path="/sale" component={Sale} />
            <Route exact path="/sale/create" component={SaleCreate} />
            <Route exact path="/sale/:id" component={SaleEdit} />
            <Redirect to="/" />
          </Switch>
        </div>
      </main>
    </div>
  </Router>
  );
}

export default App;