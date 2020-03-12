/*
公海分部管理
*/

import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col,Button, DatePicker
} from 'antd'; 
const FormItem = Form.Item; 
import { searchFormItemLayout, loadBizDictionary, onToggleSearchOption,renderSearchBottomButtons } from '@/utils/componentExt';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg'; 
import ContentBox from '@/components/ContentBox'; 
import { HighSeasBranchManagementAddBranch } from '@/actions/admin'; 
import { formatMoment } from '@/utils';

class HighSeasBranchManagement extends React.Component {

  constructor(props) {
    super(props); 
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this); 
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this); 

    this.state = { 
      loading: false,
    };
  } 

  onCancel = () => {
    this.props.viewCallback();
  }
  //新增
  onAddBranch = () => {
    this.props.form.validateFields((err, values) => {
        if (!err) {  
          values.publicDate = formatMoment(values.publicDate) 
        this.props.HighSeasBranchManagementAddBranch({branchId:values.branchId,publicDate:values.publicDate}).payload.promise.then((response) => {
                let data = response.payload.data; 
                if(data.state == 'success'){
                    message.success('新增成功！')
                    this.props.viewCallback();
                }else{
                    message.error(data.msg)
                }
            })
        }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div> 
        let extendButtons = [];
        extendButtons.push(<Button onClick={this.onAddBranch} icon="plus">添加</Button>)
        extendButtons.push(<Button onClick={this.onCancel} icon="rollback">返回</Button>)
        block_content = (
          <div>
            <ContentBox titleName={'新增公海分部'} bottomButton={this.renderSearchBottomButtons(extendButtons,'l','r')}>
                <Form className="search-form">
                  <Row justify="center" gutter={24} align="middle" type="flex">
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="分部名称">
                            {getFieldDecorator('branchId', {
                                initialValue: '',
                                rules: [{
                                    required: true, message: '请选择分部!',
                                  }]
                            })(
                                <SelectFBOrg scope={'all'} hideAll={false} />
                                )}
                        </FormItem>
                    </Col> 
                    <Col span={12}>
                        <FormItem {...searchFormItemLayout} label="进入公海日期">
                            {getFieldDecorator('publicDate', {
                                initialValue: '', 
                            })(
                                <DatePicker  style={{width:'200px'}} />
                                )}
                        </FormItem>
                    </Col> 
                  </Row>
                </Form> 
            </ContentBox>
            <div className="space-default"></div> 
          </div>  
        )
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(HighSeasBranchManagement);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return { 
    HighSeasBranchManagementAddBranch: bindActionCreators(HighSeasBranchManagementAddBranch, dispatch),

  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
