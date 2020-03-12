//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, InputNumber, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
import { getProtectionInfo, updateProtection} from '@/actions/recruit';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import UpdateProtectionView from './view';
const formItemLayout24 = {
  labelCol: { span: 14 },
  wrapperCol: { span: 6 }
};

class MarketProtectionPeriod extends React.Component {

  constructor(props) {
    super(props)
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: props.pagingSearch,
      data: [],
      loading: false,
      value:"",
    };
  }
  componentWillMount() {
    this._isMounted = true;
    //载入需要的字典项
    //this.loadBizDictionary(['dic_Status', 'teach_center_type']);

    //首次进入搜索，加载服务端字典项内容
    this.onSearch();

  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = this.props.pagingSearch;
    this.props.getProtectionInfo(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      this.state.value = data.data.value;
      if (data.state != 'success') {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        if (this._isMounted) {
          this.setState({ pagingSearch: condition, ...data, loading: false })
        }
      }
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };

  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    }
    else {
      switch (this.state.editMode) {
        case "Edit":
          this.props.updateProtection(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state != 'success') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })

          break;
      }
    }
  }



  //渲染，根据模式不同控制不同输出
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "Edit":
        block_content = <UpdateProtectionView viewCallback={this.onViewCallback} {...this.state} />
        break;
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        extendButtons.push(<Button onClick={() => { this.onLookView('Edit', {}) }
        } icon="edit" type="primary" >修改学生市场保护期</Button>);

        // extendButtons.push(<Button onClick={() => { this.onCancel() }
        // }  icon="rollback" className="button_dark" >返回</Button>);

        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox  bottomButton={this.renderSearchBottomButtons(extendButtons,'',true)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row justify="center" gutter={24} align="middle" type="flex">
                <Col span={12}>
                  <FormItem
                    {...formItemLayout24}
                    label="学生市场保护期">
                    {/*{this.props}*/}
                    {this.state.value}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          {/*<div className="space-default"></div>*/}
          {/* 数据表格 */}
          {/*<div className="search-result-list">*/}
            {/*<Table columns={this.columns} //列定义*/}
                   {/*loading={this.state.loading}*/}
                   {/*pagination={false}*/}
                   {/*dataSource={this.state.data}//数据*/}
                   {/*bordered*/}
            {/*/>*/}

          {/*</div>*/}
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedMarketProtectionPeriod = Form.create()(MarketProtectionPeriod);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    getProtectionInfo: bindActionCreators(getProtectionInfo, dispatch),
    updateProtection: bindActionCreators(updateProtection, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedMarketProtectionPeriod);
