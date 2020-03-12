/*
公海分部管理
*/
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { Modal, message, Form, Row, Col,Button,
  Table, Pagination } from 'antd'; 
const confirm = Modal.confirm;
import { timestampToTime } from '@/utils';
import { env } from '@/api/env'; 
import { loadBizDictionary,onToggleSearchOption, onSearch, onPageIndexChange, onShowSizeChange , renderSearchTopButtons, renderSearchBottomButtons,searchFormItemLayout} from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic'; 
import { postRecruitBatchList } from '@/actions/recruit';
import { HighSeasBranchManagementList,HighSeasBranchManagementDelete } from '@/actions/admin'
 
import DropDownButton from '@/components/DropDownButton';
import AddBranch from './AddBranch';



class OrderQuery extends React.Component {
  state= {
    editMode: '',
    pagingSearch: {
      currentPage: 1,
      pageSize: env.defaultPageSize,
    },
    data_list: [],
    loading: false,
    totalRecord: 0,
    currentDataModel: {},
    isShowQrCodeModal: false,
    deleteId:'',
    ButtonProps:false,
    recruitList:[],
    recruitBatchName:''
  };
  constructor(){
    super();
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    (this: any).fetch = this.fetch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
    this.onSearch()
  }

  columns = [
    {
        title: '分部名称',
        width:200,
        fixed:'left',
        dataIndex: 'branchName'
    },
    {
        title: '创建日期',
        // width:400, 
        dataIndex: 'createDate',
        render:(text,record)=>{
          return timestampToTime(record.createDate)
        }
    },
    {
        title: '进入公海日期',
        // width:400, 
        dataIndex: 'publicDate',
        render:(text,record)=>{
          return timestampToTime(record.publicDate)
        }
    },
    {
      title: '操作',
      width:200,
      fixed:'right',
      render: (text, record) => {
          return <DropDownButton>
              <Button onClick={() => { this.showConfirm(record)}}>删除</Button>
          </DropDownButton>
      }
    }
  ]; 
  //检索数据
  fetch(params){
      var condition = params || this.state.pagingSearch; 
      this.setState({ loading: true, pagingSearch: condition });
      this.props.HighSeasBranchManagementList().payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = data.data;
            //list.push(data.data);
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  } 
  addBranch = () => {
    this.setState({
      editMode:'Add'
    })
  }
  onViewCallback = () => { 
      this.onSearch();
      this.setState({ editMode: 'Manage' }) 
  }
  showConfirm = (value) => {
    let that = this;
    confirm({
      title: '确定删除这个分部吗？',
      content: '',
      onOk() { 
        that.props.HighSeasBranchManagementDelete({branchPublicId:value.branchPublicId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
              that.onSearch();
              message.success('操作成功！')
            }else{
              message.error(data.error)
            }
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }
  render(){ 
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Add':
        block_content = (<AddBranch viewCallback={this.onViewCallback}/>)
      break
      case 'Manage':
      default:
        block_content = (
          <div>  
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                // scroll={{x:600}}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={2}>
                    <Button icon='plus' onClick={()=>this.addBranch()}>增加</Button>
                  </Col>
                  <Col span={22} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize} 
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
                
                <Row justify="end" align="middle" type="flex">
                </Row>
              </div>
            </div> 
          </div>
        )
        break;
    }
    return  block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(OrderQuery);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    //1 总部；2 大区；3 分部
    let orgType = state.auth.currentUser.userType.usertype;
    return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
    return {
        HighSeasBranchManagementList: bindActionCreators(HighSeasBranchManagementList, dispatch),
        HighSeasBranchManagementDelete: bindActionCreators(HighSeasBranchManagementDelete, dispatch),
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
