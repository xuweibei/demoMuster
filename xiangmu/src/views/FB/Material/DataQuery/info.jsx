
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader,Upload 
} from 'antd'; 
const FormItem = Form.Item; 

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox'; 
 
import { PublicSubpageQuery } from '@/actions/base';
import FileDownloader from '@/components/FileDownloader'; 
import { timestampToTime } from '@/utils';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class StudentStudyDetail extends React.Component {
    constructor(props) {
        super(props)

        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.state = {
            showTable:true,
            visible:false,
            pagingSearch:{
                isAllow:''
            },
            dataModel: { ...props.currentDataModel, stageList: [] },
            webCourseList:[], 
        };
    }
    componentWillMount() {
      //载入需要的字典项
      this.loadBizDictionary([ 'category_state','dic_sex','teach_class_type']); 
      this.fetch(); 
    } 
    fetch = () =>{
        this.setState({loading:true})
        this.props.PublicSubpageQuery({ materialId:this.props.currentDataModel.materialId,branchId:this.props.branchId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {
                if(data.data.isPack=='否'){
                    this.setState({
                        showTable:false,
                        loading: false
                    })
                    return 
                }
                let arr = [];
                if(data.data.childMaterials)arr = data.data.childMaterials.data;
                this.setState({ 
                    loading: false,
                    dataModel:data.data,
                    webCourseList: arr
                })
            }
            else {
                this.setState({ loading: false })
                message.error(data.message);
            }
        });
    }
    onCancel = () => {
        this.props.viewCallback();
    } 
    //标题
    getTitle() { 
        if(this.props.editMode == 'View'){
          return '资料申请详细信息'
        }else if(this.props.editMode == 'Edit'){
          return '资料编辑'
        }else if(this.props.editMode == 'Receipt'){ 
          return '资料申请到件反馈'
        } else{
             return '资料详细信息'
        }
    }
    //表单按钮处理
    renderBtnControl() { 
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button onClick={this.onCancel} icon="rollback">返回</Button>
        </FormItem> 
    } 
 
    //table 输出列定义
    columnInfo= [
        {
          title: '序号',
          fixed: 'left',
          width:'100',
          render:(text,record,index)=>{
              return index+1
          }
        },
        {
          title: '资料名称',
          dataIndex: 'materialName'
        },
        {
          title: '项目',
          dataIndex: 'itemName', 
        },
        {
          title: '科目',
          dataIndex: 'courseCategoryName', 
        },
        {
          title: '课程',
          dataIndex: 'courseName', 
        },
        {
          title: '资料类型',
          dataIndex: 'materialType', 
        },
        {
          title: '状态',
          dataIndex: 'materialStatus', 
        },
        {
          title: '外购',
          dataIndex: 'isOutside', 
        },
        {
          title: '创建人',
          dataIndex: 'founder', 
        },
        {
          title: '最新修改人',
          dataIndex: 'modifier', 
        },
        {
          title: '最新修改日期',
          fixed: 'right',
          width:'200', 
          dataIndex: 'modifyDate',
          render:(text,record)=>{
              return timestampToTime(record.modifyDate)
          }
        }
      ];

    render() {
        let title = this.getTitle();
        let block_content = <div></div> 
            switch (this.props.editMode) {  
                    case 'infoName':
                    case 'ViewS':
                    case 'ViewInfo': 
                     block_content = ( 
                      <Form>
                          <Row gutter={24}>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '资料名称'
                                  >
                                    <div>
                                        {this.state.dataModel.materialName}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '状态'
                                  > 
                                    {this.state.dataModel.materialStatus} 
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '资料类型'
                                  >
                                    <div>
                                        {this.state.dataModel.materialType}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '是否外购'
                                  >
                                    <div>
                                        {this.state.dataModel.isOutside}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '是否打包资料'
                                  >
                                    <div>
                                        {this.state.dataModel.isPack}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '教师'
                                  >
                                    <div>
                                        {this.state.dataModel.teacher}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '所属项目'
                                  >
                                    <div>
                                        {this.state.dataModel.itemName}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '所属科目'
                                  >
                                    <div>
                                        {this.state.dataModel.courseCategoryName}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '所属课程'
                                  >
                                    <div>
                                        {this.state.dataModel.courseName}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={24}>
                                  <FormItem
                                  {...searchFormItemLayout24}
                                  label = '附件'
                                  > 
                                  {
                                      this.state.dataModel.materialFile?
                                    <FileDownloader
                                                apiUrl={this.state.dataModel.materialFile}//api下载地址
                                                method={'post'}//提交方式
                                                options={{ filePath: 'upload/importTemplate/customersFeeUpload.xlsx' }}
                                                title={'下载模板'}
                                                >
                                    </FileDownloader>:'无'
                                  }
                                    
                                  </FormItem>
                              </Col>
                              <Col span={24}>
                                  <FormItem
                                  {...searchFormItemLayout24}
                                  label = '说明'
                                  >
                                    <div>
                                        {this.state.dataModel.remark}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '创建人'
                                  >
                                    <div>
                                        {this.state.dataModel.founder}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '创建日期'
                                  >
                                    <div>
                                        {this.state.dataModel.createDate}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '最后修改人'
                                  >
                                   <div>
                                        {this.state.dataModel.modifier}
                                    </div>
                                  </FormItem>
                              </Col>
                              <Col span={12}>
                                  <FormItem
                                  {...searchFormItemLayout}
                                  label = '最后修改日期'
                                  >
                                    <div>
                                        {this.state.dataModel.modifyDate}
                                    </div>
                                  </FormItem>
                              </Col>
                          </Row> 
                            <Row> 
                                {
                                    this.state.showTable?
                                    <div className="search-result-list" style={{padding:'0 20px'}}>
                                        <div className="space-default"></div>
                                        <p style={{paddingBottom:20}}>包含子资料信息：</p>
                                            <Table columns={this.columnInfo} //列定义
                                                    loading={this.state.loading}
                                                    pagination={false}
                                                    dataSource={this.state.webCourseList}//数据
                                                    bordered
                                                    scroll={{ x: 1800 }}
                                            /> 
                                    </div>:''
                                }
                                
                            </Row>
                      </Form>)
                    break;
            } 

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24}>
                            <ChangeDetailInfo studentChangeId={this.state.dataModel.studentChangeId} />
                        </Col>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(StudentStudyDetail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let branchId = state.auth.currentUser.userType.orgId;
    return { Dictionarys,branchId };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
      PublicSubpageQuery: bindActionCreators(PublicSubpageQuery, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
