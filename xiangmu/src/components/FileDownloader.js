import React from 'react'
import ReactDOM from 'react-dom'
import { Button } from 'antd'
import { formatMoment } from '@/utils';
import { env } from '@/api/env';
import moment from 'moment';

class FileDownloader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      title: props.title || '下载',
      apiUrl: props.apiUrl || '',
      method: props.method || 'post',
      type: props.type || '',
    };
    (this: any).download2 = this.download2.bind(this);
    (this: any).download = this.download.bind(this);
  }

  download2(){
    var that = this;
    if(this.props.clickCallback){
      this.props.clickCallback(function(options){
        that.download(options);
      });
    }else {
      this.download();
    }
  }

  download = (option) => {
    let { apiUrl } = this.state;
    let options = option ? option : this.props.options || [];//获取参数
    let { serverURL, getToken } = env;
    var divElement = document.getElementById("downloadDiv");
    var downloadUrl = `${serverURL}${apiUrl}`;
    var params = {
      token: getToken(),
      ...options
    }
    
    ReactDOM.render(
      <form action={downloadUrl} method={this.state.method}>
        {Object.keys(params).map((key, index) => {
          if(moment.isMoment(params[key])){//针对日期格式进行转换
            params[key] = formatMoment(params[key])
          }
          return <input name={key} type="hidden" value={params[key]} />
        })
        }
      </form>,
      divElement
    )
    ReactDOM.findDOMNode(divElement).querySelector('form').submit();
    ReactDOM.unmountComponentAtNode(divElement);
  }

  render() {
    return (
      <span>
        <Button onClick={this.download2} icon="export" className="button_dark">{this.state.title}</Button>
        <div id='downloadDiv' style={{ display: 'none' }}></div>
      </span>
    )
  }
}
export default FileDownloader
